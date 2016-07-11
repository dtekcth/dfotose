import _ from 'lodash';
import uuid from 'uuid';
import {Router} from 'express';

import {LoggedInRequired} from './auth-api.js';
import Logger from '../logger';
import config from '../config';

import Image from '../model/image';

const router = Router();
export default router;

import multer from 'multer';
import fs from 'fs-extra';

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = config.storage.temporaryImagePath;
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const filename = `${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: imageStorage });

// Make sure storage directories are created
fs.mkdirs(config.storage.temporaryImagePath, (err) => {
  if (err) {
    Logger.error(`Could not create storage directory ${config.storage.temporaryImagePath}`);
    throw err;
  }
});
fs.mkdirs(config.storage.path, (err) => {
  if (err) {
    Logger.error(`Could not create storage directory ${config.storage.path}`);
    throw err;
  }
});

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
router.post('/image', LoggedInRequired, upload.array('photos'), (req, res) => {
  const userId = req.session.user.id;
  const images = req.files;
  _.forEach(images, (image) => {
    const fieldName = _.get(image, 'fieldname');
    if (fieldName !== 'photos') {
      res.status(500).send();
      throw "incorrect fieldName specified";
    }

    // Since this file is unattached, give it a uuid as filename
    const extension = image.originalname.split('.').pop();
    const filename = uuid.v4();
    const imagePath = config.storage.path;
    const fullSizeImagePath = `${imagePath}/${filename}.${extension}`;
    
    fs.move(image.path, fullSizeImagePath, (err) => {
      if (err) {
        Logger.error(err);
      }
      
      // TODO: generate thumbnail
      var newImage = new Image({
        filename: filename,
        authorId: userId,
        galleryId: 'undefined',
        thumbnail: 'undefined',
        fullSize: fullSizeImagePath
      });
      
      newImage.save((err) => {
        if (err) {
          Logger.error(err);
          throw err;
        }
        
        Logger.info(`Saved image ${filename}`);
      });
    });
  });
  
  Logger.info(`${images.length} new images uploaded by ${req.session.user.id}`);
  
  res.status(202).send();
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
