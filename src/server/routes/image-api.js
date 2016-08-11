import _ from 'lodash';
import uuid from 'uuid';
import {Router} from 'express';
import multer from 'multer';
import fs from 'fs-extra';

import {LoggedInAsDfotoRequired} from './auth-api.js';
import Logger from '../logger';
import config from '../config';

import Image from '../model/image';
import Gallery from '../model/gallery';

const router = Router();
export default router;

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

    res.send(images);
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

    res.send(image);
  });
});

function handleImages(req, res, galleryId) {
  const userCid = req.session.user.cid;
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
        authorCid: userCid,
        galleryId: galleryId,
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

  Logger.info(`${images.length} new images uploaded by ${req.session.user.cid}`);
}

// Upload images
//  - The images will not be attached to any
//    gallery when uploaded
router.post('/image', LoggedInAsDfotoRequired, upload.array('photos'), (req, res) => {
  handleImages(req, res, 'undefined');
  
  res.status(202).send();
});

// Upload images to a specific gallery
//  - Author is always the logged-in user
//  - The images will be added to the gallery
//    automatically.
router.put('/image/:galleryId', LoggedInAsDfotoRequired, (req, res) => {
  const galleryId = req.params.galleryId;

  // Validate the gallery
  Gallery.findById(galleryId, (err) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }
    
    handleImages(req, res, galleryId);
    res.status(202).send();
  });
});

// Delete a specific image
//  - Note: this automatically removes all gallery
//          associations.
router.delete('/image/:id', LoggedInAsDfotoRequired, (req, res) => {
  const id = req.params.id;

  Image.findByIdAndRemove(id, (err, image) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }
    
    Logger.info(`User ${req.session.user.cid} removed image ${id}`);
    
    res.status(202).send();
  });
});
