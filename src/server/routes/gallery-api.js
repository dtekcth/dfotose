import {Router} from 'express';

import LoggedInRequired from './auth-api.js';

const router = Router();
export default router;

// Return all galleries
router.get('/gallery', (req, res) => {
  res.send('undefined');
});

// Return a specific gallery
router.get('/gallery/:id', (req, res) => {
  res.send('undefined');
});

// Create an entirely new gallery
//    - Possibly associate with an event or
//      to restrict it to one gallery per event.
router.post('/gallery', (req, res) => {
  res.send('undefined');
});

// Modify an existing gallery
//  - Should not be able to modify authors
//      as they should be set automatically and
//      removed automatically.
router.put('/gallery/:id', (req, res) => {
  res.send('undefined');
});

// Remove an entire gallery
//  should not be used ever imho.
router.delete('/gallery/:id', (req, res) => {
  res.send('undefined');
});
