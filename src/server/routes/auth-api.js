const _ = require('lodash');
const { Router, json } = require('express');
const { spawn } = require("child_process");
const { inHTMLData } = require('xss-filters');

const User = require('../model/user');
const { Restrictions } = require('../model/user-roles');
const { updateAuthorOfImagesUploadedByCid } = require('./image-api');
const { fetchInitialRole, removeElevatedIfExists } = require('./user-role-api');
const { LoggedInRequired, hasRestrictions, requireRestrictions } = require('./permissions');
const Logger = require('../logger');
const { abortOnError } = require('../utils');


const router = Router();

const jsonParser = json();

// Get the currently logged in User
router.get('/auth/user', LoggedInRequired, (req, res) => {
  res.send(req.session.user);
});

// Get all saved users
router.get('/auth/users', requireRestrictions(Restrictions.READ_USERS), async (req, res) => {
  try {
    const users = await User.find({}).lean().exec();
    Logger.info(`User ${req.session.user.cid} fetched all other users`);
    res.send(users);
  } catch (err) {
    abortOnError(err, res);
  }
});

async function authUserKrb5Password(cid, password) {
  return new Promise((resolve, reject) => {
    const child = spawn("kinit", [`${cid}@CHALMERS.SE`]);

    let stderr = "";
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(stderr || `kinit failed with code ${code}`));
      }
    });

    // Send password to kinit
    child.stdin.write(password + "\n");
    child.stdin.end();
  });
}


// Login a User
router.post('/auth/login', jsonParser, async (req, res) => {
  const { cid, password } = req.body;

  // Dev bypass
  //handleDevBypass(cid, req, res);
  //return;

  try {
    const ok = await authUserKrb5Password(cid, password);
    if (!ok) {
      return res.status(401).end();
    }

    const results = await User.find({ cid: cid }).lean().exec();

    if (_.isEmpty(results)) {
      // First time login
      const role = await fetchInitialRole(cid);
      const user = {
        cid,
        fullname: '',
        role
      };

      await User.create(user);
      req.session.user = user;
      Logger.info(`${cid} logged in first time, initialized with role ${role}`);
      await removeElevatedIfExists(cid);
      res.send(user);
    } else {
      const user = _.head(results);
      req.session.user = user;

      Logger.info(`User ${user.cid} logged in. Has role ${user.role}`);

      // Migration for old role system
      const dfotoMember = _.get(user, 'dfotoMember', false);
      if (dfotoMember && user.role === 'None') {
        user.role = 'Admin';
        _.set(req.session, 'user.role', 'Admin');

        await User.findOneAndUpdate({ cid: user.cid }, { $set: { role: 'Admin' }});
        Logger.info(`Migrated ${user.cid} to new role-based system.`);
      }

      res.send(user);
    }
  } catch (err) {
    abortOnError(err, res);
  }
});

// Change User data
router.put('/auth/user/:cid', LoggedInRequired, jsonParser, async (req, res) => {
  const cid = req.params.cid;
  const { fullname } = req.body;
  const filteredFullname = inHTMLData(fullname);

  const canWriteUsers = hasRestrictions(req, Restrictions.WRITE_USERS);
  if (cid !== req.session.user.cid && !canWriteUsers) {
    res.status(403).json({ error: 'forbidden' });
    Logger.warn(`User ${req.session.user.cid} had insufficient permissions to write another users data`);
    return;
  }

  const updated = { fullname: filteredFullname };

  if (_.has(req.body, 'role')) {
    if (!canWriteUsers) {
      res.status(403).json({ error: 'forbidden' });
      Logger.warn(`User ${req.session.user.cid} had insufficient permissions to change another users role`);
      return;
    }
    updated.role = _.get(req.body, 'role', 'None');
  }

  try {
    await User.findOneAndUpdate({ cid: cid }, { $set: updated });
    // Update current session user if self-updated
    if (req.session.user.cid === cid) {
      _.merge(req.session.user, updated);
    }

    updateAuthorOfImagesUploadedByCid(cid, filteredFullname);
    res.status(202).end();
  } catch (err) {
    abortOnError(err, res);
  }
});

// Logout
router.get('/auth/logout', LoggedInRequired, (req, res) => {
  req.session.destroy();
  res.status(200).end();
});

// Helpers
async function handleDevBypass(cid, req, res) {
  try {
    const results = await User.find({ cid }).lean().exec();
    if (_.isEmpty(results)) {
      const user = {
        cid,
        fullname: 'Dev User',
        role: 'Admin'
      };
      await User.create(user);
      req.session.user = user;
      Logger.info(`${cid} logged in via dev bypass`);
      res.send(user);
    } else {
      const user = _.head(results);
      req.session.user = user;
      Logger.info(`${cid} logged in via dev bypass`);
      res.send(user);
    }
  } catch (err) {
    abortOnError(err, res);
  }
}

module.exports = {
  router
};
