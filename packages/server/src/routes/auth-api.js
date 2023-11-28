import { Router } from 'express';
import bodyParser from 'body-parser';
import kerberos from 'kerberos';
import { inHTMLData } from 'xss-filters';

import User from '../model/user.js';
import { Restrictions, getRestrictionsForRole } from '../model/user-roles.js';

import { updateAuthorOfImagesUploadedByCid } from './image-api.js';
import { fetchInitialRole, removeElevatedIfExists } from './user-role-api.js';
import ah from 'express-async-handler';

import Logger from '../logger.js';
import { get, has, head, isEmpty, merge, set } from 'lodash-es';

const router = Router();
export default router;

const jsonParser = bodyParser.json();

// Get the currently logged in User
//  - Returns 403 if not logged-in
router.get('/auth/user', LoggedInRequired, (req, res) => {
  const user = req.session.user;
  res.send(user);
});

// Get all -saved- users
//  - Returns 403 if not logged-in
router.get(
  '/auth/users',
  requireRestrictions(Restrictions.READ_USERS),
  ah(async (req, res) => {
    const users = await User.find({});

    Logger.info(`User ${req.session.user.cid} fetched all other users`);

    res.send(users);
  })
);

// Login a User
//  - Logs out the previous User if any
router.post(
  '/auth/login',
  jsonParser,
  ah(async (req, res) => {
    const { cid, password } = req.body;

    await kerberos.checkPassword(cid, password, '');

    const results = await User.find({ cid: cid });

    // first time login ?
    if (isEmpty(results)) {
      // In case somebody marked this user to receive
      // elevated permissions upon first login
      const role = await fetchInitialRole(cid);
      const user = await new User({
        cid: cid,
        fullname: '',
        role: role,
      }).save();

      req.session.user = user;
      Logger.info(`${cid} logged in first time, initialized with role ${role}`);

      await removeElevatedIfExists(cid);

      res.send(user);
    } else {
      const user = head(results);
      req.session.user = user;

      Logger.info(`User ${user.cid} logged in. Has role ${user.role}`);

      // Migrate this user once logged in to the new role-based-system.
      const dfotoMember = get(user, 'dfotoMember', false);
      if (dfotoMember && user.role == 'None') {
        user.role = 'Admin';
        set(req.session, 'user.role', 'Admin');

        await User.findOneAndUpdate(
          { cid: user.cid },
          { $set: { role: 'Admin' } }
        );
        Logger.info(`Migrated ${user.cid} to new role-based system.`);
      }

      res.send(user);
    }
  })
);

/* Change User-data

  NOTE: this supports setting the restrictions of other users
        as well as the current user; but only if Restrictions.WRITE_USERS
        is met.
 */
router.put(
  '/auth/user/:cid',
  LoggedInRequired,
  jsonParser,
  ah(async (req, res) => {
    const cid = req.params.cid;
    const { fullname } = req.body;
    const filteredFullname = inHTMLData(fullname);

    const canWriteUsers = hasRestrictions(req, Restrictions.WRITE_USERS);
    if (cid != req.session.user.cid && !canWriteUsers) {
      res.status(403).end();
      Logger.warn(
        `User ${req.session.user.cid} had insufficient permissions to write another users data`
      );
      return;
    }

    const updated = {
      fullname: filteredFullname,
    };

    if (has(req.body, 'role')) {
      if (!canWriteUsers) {
        res.status(403).end();
        Logger.warn(
          `User ${req.session.user.cid} had insufficient permissions to change another users role`
        );
        return;
      }

      updated.role = get(req.body, 'role', 'None');
    }

    await User.findOneAndUpdate({ cid: cid }, { $set: updated });

    // Update current User object
    if (req.session.user.cid === cid) {
      merge(req.session.user, updated);
    }

    updateAuthorOfImagesUploadedByCid(cid, filteredFullname);

    res.status(202).end();
  })
);

// Logout the currently logged-in User
//  - Returns 403 if not logged-in
router.get('/auth/logout', LoggedInRequired, (req, res) => {
  req.session.destroy(() => {
    res.status(200);
    res.end();
  });
});

function isLoggedIn(req) {
  const hasSession = has(req, 'session');
  const hasSessionUser = has(req, 'session.user');
  return hasSession && hasSessionUser;
}

// Middleware for express to ensure
//  that a valid User is logged-in before continuing.
export function LoggedInRequired(req, res, next) {
  if (isLoggedIn(req)) {
    next();
  } else {
    res.status(403).end();
  }
}

export function hasRestrictions(req, restrictions) {
  if (!isLoggedIn(req)) {
    return false;
  }

  const roleName = get(req, 'session.user.role', 'None');
  const roleRestrictions = getRestrictionsForRole(roleName);
  return (roleRestrictions & restrictions) != 0;
}

// Middleware for express to ensure
//  that a certain set of restrictions is met before serving
//  the request.
export function requireRestrictions(restrictions) {
  return (req, res, next) => {
    if (hasRestrictions(req, restrictions)) {
      next();
    } else {
      res.status(403).end();
    }
  };
}
