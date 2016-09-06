import _ from 'lodash';
import uuid from 'uuid';
import {Router} from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

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
router.get('/image/:id/fullSize', (req, res) => {
  const id = req.params.id;

  Image.findById(id, (err, image) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }

    res.sendFile(image.fullSize);
  });
});

router.get('/image/:id/thumbnail', (req, res) => {
  const id = req.params.id;

  Image.findById(id, (err, image) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }

    res.sendFile(image.thumbnail);
  });
});

router.get('/image/:id/preview', (req, res) => {
  const id = req.params.id;

  Image.findById(id, (err, image) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }

    res.sendFile(image.preview);
  });
});

function createDirectoryIfNeeded(dir) {
  try {
    fs.statSync(dir);
  } catch(err) {
    fs.mkdirSync(dir);
  }
}

function handleImages(req, res, galleryId) {
  const userCid = req.session.user.cid;
  const images = req.files;

  _.forEach(images, (image) => {
    const fieldName = _.get(image, 'fieldname');
    if (fieldName !== 'photos') {
      res.status(500).send();
      throw "incorrect fieldName specified";
    }

    const extension = image.originalname.split('.').pop();
    const filename = uuid.v4();
    const galleryPath = path.resolve(config.storage.path, galleryId);
    const fullSizeImagePath = `${galleryPath}/${filename}.${extension}`;

    createDirectoryIfNeeded(galleryPath);
    createDirectoryIfNeeded(path.resolve(galleryPath, "thumbnails"));
    createDirectoryIfNeeded(path.resolve(galleryPath, "previews"));

    fs.move(image.path, fullSizeImagePath, (err) => {
      if (err) {
        Logger.error(err);
      }

      const thumbnail = path.resolve(galleryPath, "thumbnails", `${filename}.${extension}`);
      sharp(fullSizeImagePath)
        .resize(null, 200)
        .toFile(thumbnail, (err) => {
          if (err) {
            Logger.error(`Could not save thumbnail for image ${filename}`);
          } else {
            Logger.info(`Saved thumbnail ${thumbnail}`);
          }
        });
      
      const preview = path.resolve(galleryPath, "previews", `${filename}.${extension}`);
      sharp(fullSizeImagePath)
        .resize(null, 600)
        .toFile(preview, (err) => {
          if (err) {
            Logger.error(`Could not save preview for image ${filename}`);
          } else {
            Logger.info(`Saved preview ${preview}`);
          }
        });

      var newImage = new Image({
        filename: filename,
        authorCid: userCid,
        galleryId: galleryId,
        thumbnail: thumbnail,
        preview: preview,
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
//  - Author is always the logged-in User
//  - The images will be added to the gallery
//    automatically.
router.post('/image/:galleryId', LoggedInAsDfotoRequired, upload.array('photos'), (req, res) => {
  const galleryId = req.params.galleryId;

  // Validate the gallery
  Gallery.findById(galleryId, (err) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }
    
    Logger.info(`Preparing upload of files to gallery ${galleryId}`);
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
