const _ = require('lodash');
const { Router, json } = require('express');

const Image = require('../model/image');
const { UserEligibleForRole, Restrictions } = require('../model/user-roles');
const { requireRestrictions } = require('./permissions');
const Logger = require('../logger');
const { abortOnError } = require('../utils');

const router = Router();
const jsonParser = json();

// Fetch all users that are eligible to be elevated
router.get('/user/eligible',
  requireRestrictions(Restrictions.READ_USERS),
  async (req, res) => {
    try {
      const eligibleUsers = await UserEligibleForRole.find({});
      res.send(eligibleUsers);
    } catch (err) {
      abortOnError(err, res);
    }
  }
);

// Counts uploaded pictures by photographer cid for the admin members table.
router.get('/user/photo-counts',
  requireRestrictions(Restrictions.READ_USERS),
  async (req, res) => {
    try {
      const counts = await Image.aggregate([
        { $match: { authorCid: { $exists: true, $ne: '' } } },
        { $group: { _id: '$authorCid', count: { $sum: 1 } } }
      ]).exec();

      const countsByCid = counts.reduce((result, row) => {
        result[row._id] = row.count;
        return result;
      }, {});

      res.send(countsByCid);
    } catch (err) {
      abortOnError(err, res);
    }
  }
);

// Sets a user to be elevated
router.post('/user/eligible',
  requireRestrictions(Restrictions.WRITE_USERS),
  jsonParser,
  async (req, res) => {
    const { cid, role } = req.body;

    try {
      const user = await UserEligibleForRole.findOne({ cid });
      if (user) {
        res.status(500).send(`${cid} already has one added ..`);
        return;
      }

      await UserEligibleForRole.create({ cid, role });
      Logger.info(`${req.session.user.cid} set ${cid} to be elevated to role ${role}`);
      res.send({ cid, role });
    } catch (err) {
      abortOnError(err, res);
    }
  }
);

// Remove a user from getting elevated
router.delete('/user/eligible/:cid',
  requireRestrictions(Restrictions.WRITE_USERS),
  async (req, res) => {
    const cid = req.params.cid;

    try {
      await UserEligibleForRole.deleteMany({ cid });
      res.status(202).end();
    } catch (err) {
      abortOnError(err, res);
    }
  }
);

// Helpers
async function fetchInitialRole(cid) {
  const eligibleUser = await UserEligibleForRole.findOne({ cid }).lean();
  return _.get(eligibleUser, 'role', 'None');
}

async function removeElevatedIfExists(cid) {
  try {
    await UserEligibleForRole.deleteMany({ cid });
  } catch (err) {
    Logger.error(err);
  }
}

module.exports = {
  router,
  fetchInitialRole,
  removeElevatedIfExists
};
