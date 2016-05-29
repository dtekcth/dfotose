import {Router} from 'express';

import LoggedInRequired from './auth-api.js';

const router = Router();
export default router;

// Return all images for a specific gallery
router.get('/image/:galleryId', (req, res) => {
  res.send('undefined');
});

// Return a specific image using an id
router.get('/image/:id', (req, res) => {
  res.send('undefined');
});

// Upload images
//  - The images will not be attached to any
//    gallery when uploaded
router.post('/image', LoggedInRequired, (req, res) => {
  res.send('undefined');
});

// Upload images to a specific gallery
//  - Author is always the logged-in user
//  - The images will be added to the gallery
//    automatically.
router.put('/image/:galleryId', LoggedInRequired, (req, res) => {
  res.send('undefined');
});

// Delete a specific image
//  - Note: this automatically removes all gallery
//          associations.
router.delete('/image/:id', LoggedInRequired, (req, res) => {
  res.send('undefined');
});
