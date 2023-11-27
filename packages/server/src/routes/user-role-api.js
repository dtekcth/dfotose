import { Router } from 'express';
import bodyParser from 'body-parser';

import UserEligibleForRole, { Restrictions } from '../model/user-roles.js';
import { requireRestrictions } from './auth-api.js';

import Logger from '../logger.js';
import ah from 'express-async-handler';
import { get } from 'lodash-es';

const router = Router();
export default router;

const jsonParser = bodyParser.json();

// Fetch all users that are eligible to be elevated
// upon first login
router.get(
  '/user/eligible',
  requireRestrictions(Restrictions.READ_USERS),
  ah(async (req, res) => {
    const eligibleUsers = await UserEligibleForRole.find({});
    res.send(eligibleUsers);
  })
);

// Sets a user to be elevated to a specific role
// upon first login
router.post(
  '/user/eligible',
  requireRestrictions(Restrictions.WRITE_USERS),
  jsonParser,
  ah(async (req, res) => {
    const { cid, role } = req.body;

    const user = await UserEligibleForRole.findOne({ cid: cid });
    if (user) {
      res.status(500).send(`${cid} already has one added ..`);
      return;
    }

    await new UserEligibleForRole({
      cid: cid,
      role: role,
    }).save();
    Logger.info(
      `${req.session.user.cid} set ${cid} to be elevated to role ${role} upon first login`
    );
    res.send({ cid: cid, role: role });
  })
);

// Remove a user from getting elevated to a specific role
// when logging in the first time.
router.delete(
  '/user/eligible/:cid',
  requireRestrictions(Restrictions.WRITE_USERS),
  ah(async (req, res) => {
    const cid = req.params.cid;

    await UserEligibleForRole.deleteOne({ cid: cid });
    res.status(202).end();
  })
);

/**
 * Used by auth-api to determine the initial role when a user
 * logs in the first time
 *
 * @param {string} cid
 * @returns {Promise<string>}
 */
export async function fetchInitialRole(cid) {
  const eligibleUser = await UserEligibleForRole.findOne({
    cid: cid,
  });
  return get(eligibleUser, 'role', 'None');
}

/**
 * Used by auth-api
 * @param {string} cid
 */
export async function removeElevatedIfExists(cid) {
  await UserEligibleForRole.deleteOne({ cid: cid });
}
