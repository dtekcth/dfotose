const _ = require('lodash');
const { getRestrictionsForRole } = require('../model/user-roles');

// Helper: check if logged in
function isLoggedIn(req) {
  return _.has(req, 'session.user');
}

// Middleware: must be logged in
function LoggedInRequired(req, res, next) {
  if (isLoggedIn(req)) {
    next();
  } else {
    res.status(403).end();
  }
}

// Utility: check restrictions manually
function hasRestrictions(req, restrictions) {
  if (!isLoggedIn(req)) return false;
  const roleName = _.get(req, 'session.user.role', 'None');
  const roleRestrictions = getRestrictionsForRole(roleName);
  return (roleRestrictions & restrictions) !== 0;
}

// Middleware: enforce restrictions
function requireRestrictions(restrictions) {
  return (req, res, next) => {
    if (hasRestrictions(req, restrictions)) {
      next();
    } else {
      res.status(403).end();
    }
  };
}

module.exports = {
  LoggedInRequired,
  hasRestrictions,
  requireRestrictions
};
