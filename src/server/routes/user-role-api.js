const _ = require('lodash');
const { Router } = require('express');
const bodyParser = require('body-parser');

const { UserEligibleForRole, Restrictions } = require('../model/user-roles');
const { requireRestrictions } = require('./permissions');
const Logger = require('../logger');
const { abortOnError } = require('../utils');

const router = Router();
const jsonParser = bodyParser.json();

// Fetch all users that are eligible to be elevated
router.get('/user/eligible',
  requireRestrictions(Restrictions.READ_USERS),
  (req, res) => {
    UserEligibleForRole.find({}, (err, eligibleUsers) => {
      abortOnError(err, res);
      res.send(eligibleUsers);
    });
  }
);

// Sets a user to be elevated
router.post('/user/eligible',
  requireRestrictions(Restrictions.WRITE_USERS),
  jsonParser,
  (req, res) => {
    const { cid, role } = req.body;

    UserEligibleForRole.findOne({ cid }, (err, user) => {
      abortOnError(err, res);
      if (user) {
        res.status(500).send(`${cid} already has one added ..`);
        return;
      }

      UserEligibleForRole({ cid, role }).save(err => {
        abortOnError(err, res);
        Logger.info(`${req.session.user.cid} set ${cid} to be elevated to role ${role}`);
        res.send({ cid, role });
      });
    });
  }
);

// Remove a user from getting elevated
router.delete('/user/eligible/:cid',
  requireRestrictions(Restrictions.WRITE_USERS),
  (req, res) => {
    const cid = req.params.cid;

    UserEligibleForRole.find({ cid }).remove(err => {
      abortOnError(err, res);
      res.status(202).end();
    });
  }
);

// Helpers
function fetchInitialRole(cid, cb) {
  UserEligibleForRole.findOne({ cid }, (err, eligibleUser) => {
    if (err) throw err;
    const role = _.get(eligibleUser, 'role', 'None');
    cb(role);
  });
}

function removeElevatedIfExists(cid) {
  UserEligibleForRole.find({ cid }).remove(err => {});
}

module.exports = {
  router,
  fetchInitialRole,
  removeElevatedIfExists
};
