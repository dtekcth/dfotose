import _ from 'lodash';
import {Router} from 'express';
import passwordHash from 'password-hash';
import bodyParser from 'body-parser';

import User from '../model/user';

import Logger from '../logger';

const router = Router();
export default router;

const jsonParser = bodyParser.json();

// Get the currently logged in user
//  - Returns 403 if not logged-in
router.get('/auth/user', LoggedInRequired, (req, res) => {
  const user = req.session.user;
  res.send(user);
});

// Get all users
//  - Returns 403 if not logged-in
router.get('/auth/users', LoggedInRequired, (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(500);
      res.send(err);
      throw err;
    }

    const strippedUsers = _.map(users, (user) => {
      return {
        id: user._id,
        username: user.username,
        fullname: user.fullname
      };
    });
    
    Logger.info(`User ${req.session.user.id} fetched all other users`);

    res.send(strippedUsers);
  });
});

// Creates a new user
//  - Returns 403 if not logged-in
router.post('/auth/user', LoggedInRequired, jsonParser, (req, res) => {
  var userData = req.body;

  // Hash the password before-hand
  const unSecurePassword = userData.password;
  userData.password = passwordHash.generate(unSecurePassword, {algorithm: 'sha512'});

  var newUser = User(userData);
  newUser.save((err) => {
    if (err) {
      res.status(500);
      res.send(err);
      throw err;
    }

    Logger.info(`New user created: ${newUser.username}`);

    // Respond with a username stripped of the
    // password
    res.send({
      username: userData.username,
      fullname: userData.fullname
    });
  });
});

// Login a user
//  - Logs out the previous user if any
router.post('/auth/login', jsonParser, (req, res) => {
  const userData = req.body;

  User.find({username: userData.username}, (err, users) => {
    if (err) {
      res.status(500);
      res.send(err);

      throw err;
    }

    if (_.isEmpty(users)) {
      res.status(404);
      res.end();
    } else {
      const user = _.head(users);
      
      // Verify the password
      if (passwordHash.verify(userData.password, user.password)) {
        Logger.info(`Logged in user ${user.id}`);
        
        req.session.user = {
          id: user._id,
          username: user.username,
          fullname: user.fullname
        };
        res.send(user);
      } else {
        res.status(403);
        res.end();
      }
    }
  });
});

// Logout the currently logged-in user
//  - Returns 403 if not logged-in
router.post('/auth/logout', LoggedInRequired, (req, res) => {
  req.session.destroy();
  res.status(200);
  res.end();
});

// Middleware for express to ensure
//  that a valid user is logged-in before continuing.
export function LoggedInRequired(req, res, next) {
  const hasSession = _.has(req, 'session');
  const hasSessionUser = _.has(req, 'session.user');
  if (hasSession && hasSessionUser) {
    next();
  } else {
    res.status(403).send();
  }
};
