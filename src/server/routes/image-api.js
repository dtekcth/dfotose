import {Router} from 'express';

import LoggedInRequired from './auth-api.js';
import Logger from '../logger';

import Image from '../model/image';

const router = Router();
export default router;

// Return all images for a specific gallery
router.get('/image/:galleryId', (req, res) => {
  const galleryId = req.params.galleryId;

  Image.find({galleryId: galleryId}, (err, images) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }
    
    const imagesWithId = _.map(images, (image) => {
      const id = _.get(image, '_id');
      _.unset(image, '_id');
      _.set(image, 'id', id);
      return image;
    });

    res.send(imagesWithId);
  });
});

// Return a specific image using an id
router.get('/image/:id', (req, res) => {
  const id = req.params.id;
  
  Image.findById(id, (err, image) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }
    
    const id = _.get(image, '_id');
    _.unset(image, '_id');
    _.set(image, 'id', id);
    
    res.send(image);
  });
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
  const id = req.params.id;

  Image.findByIdAndRemove(id, (err, image) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }
    
    Logger.info(`User ${req.session.user._id} removed image ${id}`);
    
    res.status(202).send();
  });
});
