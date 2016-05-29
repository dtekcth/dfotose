import {Router} from 'express';

const router = Router();
export default router;

// Get the currently logged in user
//  - Returns 403 if not logged-in
router.get('/auth/user', LoggedInRequired, (req, res) => {
  res.send('undefined');
});

// Login a user
//  - Logs out the previous user if any
router.post('/auth/login', (req, res) => {
  res.send('undefined');
});

// Logout the currently logged-in user
//  - Returns 404 if not logged-in
router.post('/auth/logout', (req, res) => {
  res.send('undefined');
});

// Middleware for express to ensure
//  that a valid user is logged-in before continuing.
export function LoggedInRequired(req, res, next) {
  if (req.session !== undefined && req.session.user !== undefined) {
    next();
  } else {
    res.status(403);
    res.end();
  }
};
