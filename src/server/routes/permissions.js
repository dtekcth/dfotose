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
    res.status(401).json({ authenticated: false });
  }
}

// Utility: check restrictions manually
function hasRestrictions(req, restrictions) {
  if (!isLoggedIn(req)) return false;
  const roleName = _.get(req, 'session.user.role', 'None');
  const roleRestrictions = getRestrictionsForRole(roleName);
  return (roleRestrictions & restrictions) !== 0;
}

function hasRole(req, roleName) {
  if (!isLoggedIn(req)) return false;
  return _.get(req, 'session.user.role', 'None') === roleName;
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

function requireRole(roleName) {
  return (req, res, next) => {
    if (hasRole(req, roleName)) {
      next();
    } else {
      res.status(403).end();
    }
  };
}

module.exports = {
  LoggedInRequired,
  hasRestrictions,
  requireRestrictions,
  hasRole,
  requireRole
};
