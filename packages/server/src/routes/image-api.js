import * as uuid from 'uuid';
import { Router } from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import fsp from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import bodyParser from 'body-parser';
import { inHTMLData } from 'xss-filters';
import moment from 'moment';
import exif from 'exif';

import { Restrictions } from '../model/user-roles.js';
import { requireRestrictions, hasRestrictions } from './auth-api.js';
import Logger from '../logger.js';
import { get, has, map } from 'lodash-es';

const jsonParser = bodyParser.json();

const tempPath = process.env.TEMP_PATH;
const storagePath = process.env.STORAGE_PATH;

import Image from '../model/image.js';
import ImageTag from '../model/image-tag.js';
import Gallery from '../model/gallery.js';
import User from '../model/user.js';
import { Session } from 'express-session';

const router = Router();
export default router;

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = tempPath;
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const filename = `${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: imageStorage });

// Make sure storage directories are created
fs.mkdirs(tempPath, (err) => {
  if (err) {
    Logger.error(`Could not create storage directory ${tempPath}`);
    throw err;
  }
});
fs.mkdirs(storagePath, (err) => {
  if (err) {
    Logger.error(`Could not create storage directory ${storagePath}`);
    throw err;
  }
});

// Return all images for a specific gallery
router.get('/image/:galleryId', async (req, res, next) => {
  const galleryId = req.params.galleryId;
  try {
    const images = await Image.find({ galleryId: galleryId }).sort('shotAt');
    res.send(images);
  } catch (error) {
    next(error);
  }
});

router.get('/image/:id/details', async (req, res, next) => {
  const id = req.params.id;
  try {
    const image = await Image.findById(id);
    res.send(image);
  } catch (error) {
    next(error);
  }
});

// Return a specific image using an id
router.get('/image/:id/fullSize', async (req, res, next) => {
  const id = req.params.id;
  try {
    const image = await Image.findById(id);
    res.sendFile(image.fullSize);
  } catch (error) {
    next(error);
  }
});

router.get('/image/:id/thumbnail', async (req, res, next) => {
  const id = req.params.id;
  try {
    const image = await Image.findById(id);
    res.sendFile(image.thumbnail);
  } catch (error) {
    next(error);
  }
});

router.get('/image/:id/preview', async (req, res, next) => {
  const id = req.params.id;

  try {
    const image = await Image.findById(id);
    res.sendFile(image.preview);
  } catch (error) {
    next(error);
  }
});

router.get('/image/:id/tags', async (req, res, next) => {
  const id = req.params.id;
  try {
    const imageTags = await ImageTag.find({ imageId: id });
    res.send(imageTags);
  } catch (error) {
    next(error);
  }
});

router.get('/image/:id/author', async (req, res, next) => {
  const id = req.params.id;
  try {
    const image = await Image.findById(id);
    res.send(image.author);
  } catch (error) {
    next(error);
  }
});

router.post('/image/:id/gallerythumbnail', async (req, res, next) => {
  const id = req.params.id;

  const canWriteImage = hasRestrictions(
    req,
    Restrictions.WRITE_GALLERY | Restrictions.WRITE_IMAGES
  );

  if (!canWriteImage) {
    res.status(403).end();
    Logger.warn(
      `User ${req.session.user.cid} had insufficient permissions to change thumbnail.`
    );
    return;
  }
  try {
    // Find the image that should be set as thumbnail
    const newThumb = await Image.findOne({ _id: id });

    // Remove the image that was previously thumbnail
    const oldThumbs = await Image.find({
      galleryId: newThumb.galleryId,
      isGalleryThumbnail: true,
    });
    if (oldThumbs !== null && oldThumbs.length !== 0) {
      oldThumbs.forEach((oldThumb) => {
        oldThumb.isGalleryThumbnail = false;
        oldThumb.save();
      });
    } else {
      console.log('No old thumbnail found');
    }

    // Set the new one as thumbnail
    newThumb.isGalleryThumbnail = true;
    newThumb.save();
    console.log(
      `Changed gallery thumbnail to ${id} for gallery ${newThumb.galleryId}`
    );
    res.status(202).end();
  } catch (error) {
    next(error);
  }
});

router.post('/image/:id/author', jsonParser, async (req, res, next) => {
  const imageId = req.params.id;
  const { newCid } = req.body;

  const canWriteImage = hasRestrictions(
    req,
    Restrictions.WRITE_GALLERY | Restrictions.WRITE_IMAGES
  );

  if (!canWriteImage) {
    res.status(403).end();
    Logger.warn(
      `User ${req.session.user.cid} had insufficient permissions to change author`
    );
    return;
  }

  try {
    // First find the user so we can get the fullname
    const user = await User.findOne({ cid: newCid });

    // Next, update the image
    await Image.findOneAndUpdate(
      { _id: imageId },
      {
        $set: {
          authorCid: newCid,
          author: user.fullname,
        },
      }
    );

    console.log(`Changed author to ${user.fullname} for image ${imageId}`);
    res.status(202).end();
  } catch (error) {
    next(error);
  }
});

router.post('/image/:id/tags', jsonParser, async (req, res, next) => {
  const imageId = req.params.id;

  const { tagName } = req.body;
  const filteredTagName = inHTMLData(tagName).toLowerCase();

  const imageTagData = {
    imageId: imageId,
    tagName: filteredTagName,
  };

  var newTag = new ImageTag(imageTagData);
  try {
    await newTag.save();
    const image = await Image.findById(imageId);
    image.tags.push(filteredTagName);
    const newImageTags = image.tags;
    await Image.findByIdAndUpdate(
      { _id: imageId },
      {
        $set: {
          tags: newImageTags,
        },
      }
    );

    console.log(`Added tag ${filteredTagName} to image ${imageId}`);
    res.status(202).end();
  } catch (error) {
    next(error);
  }
});

router.get('/image/tags/:tagName/search', async (req, res, next) => {
  const tagName = req.params.tagName.toLowerCase();
  try {
    const imageTags = await ImageTag.find({ tagName: tagName });

    // imageTags contains all of the ids of images we need to send
    // to the client
    const imageObjectIds = map(imageTags, (tag) => tag.imageId);

    const images = await Image.find({
      _id: {
        $in: imageObjectIds,
      },
    });
    res.send(images);
  } catch (error) {
    next(error);
  }
});

/**
 *
 * @param {string} dir
 */
function createDirectoryIfNeeded(dir) {
  try {
    fs.statSync(dir);
  } catch (err) {
    fs.mkdirSync(dir);
  }
}

/**
 *
 * @param {string} imagePath
 * @returns {Promise<import('exif').ExifData>}
 */
async function readExifData(imagePath) {
  try {
    const file = await fsp.open(imagePath, 'r');
    const buffer = await fsp.readFile(file);

    return new Promise((resolve, reject) => {
      new exif.ExifImage({ image: buffer }, (error, exifData) => {
        if (error) {
          Logger.error(`Error reading EXIF data from ${imagePath}`, error);
          reject(error);
        } else {
          resolve(exifData);
        }
      });
    });
  } catch (error) {
    Logger.error(`Error reading EXIF data from ${imagePath}`, error);
    throw error;
  }
}

/**
 *
 * @param {Session & Partial<import('express-session').SessionData>} session
 * @param {Express.Multer.File[]} files
 * @param {string} galleryId
 */
async function handleImages(session, files, galleryId) {
  const userCid = session.user.cid;
  const images = files;

  for (const image of images) {
    const fieldName = get(image, 'fieldname');
    if (fieldName !== 'photos') {
      throw new Error('incorrect fieldName specified');
    }

    const extension = image.originalname.split('.').pop();
    const filename = uuid.v4();
    const galleryPath = path.resolve(storagePath, galleryId);
    const fullSizeImagePath = `${galleryPath}/${filename}.${extension}`;

    createDirectoryIfNeeded(galleryPath);
    createDirectoryIfNeeded(path.resolve(galleryPath, 'thumbnails'));
    createDirectoryIfNeeded(path.resolve(galleryPath, 'previews'));

    try {
      await fsp.rename(image.path, fullSizeImagePath);
    } catch (error) {
      Logger.error(error);
    }

    const thumbnail = path.resolve(
      galleryPath,
      'thumbnails',
      `${filename}.${extension}`
    );
    sharp(fullSizeImagePath)
      .resize(300, 200, { fit: 'cover', position: sharp.strategy.entropy })
      .rotate() // rotates the image based on EXIF orientation data
      .toFile(thumbnail, (err) => {
        if (err) {
          Logger.error(`Could not save thumbnail for image ${filename}`);
        } else {
          Logger.info(`Saved thumbnail ${thumbnail}`);
        }
      });

    const preview = path.resolve(
      galleryPath,
      'previews',
      `${filename}.${extension}`
    );
    sharp(fullSizeImagePath)
      .resize(null, 800)
      .rotate() // rotates the image based on EXIF orientation data
      .toFile(preview, (err) => {
        if (err) {
          Logger.error(`Could not save preview for image ${filename}`);
        } else {
          Logger.info(`Saved preview ${preview}`);
        }
      });

    const exifData = await readExifData(fullSizeImagePath);
    const shotAtUnformatted = get(exifData, 'tags.DateTimeOriginal');
    const shotAt = shotAtUnformatted ? moment(shotAtUnformatted) : moment();

    const newImage = new Image({
      filename: filename,
      authorCid: userCid,
      galleryId: galleryId,
      thumbnail: thumbnail,
      preview: preview,
      fullSize: fullSizeImagePath,
      shotAt: shotAt,
      exifData,
    });

    if (has(session, 'user.fullname')) {
      newImage.author = get(session, 'user.fullname', '');
    }
    try {
      await newImage.save();
    } catch (error) {
      Logger.error(error);
      throw error;
    }
    Logger.info(`Saved image ${filename}`);
  }

  Logger.info(`${images.length} new images uploaded by ${session.user.cid}`);
}

// Upload images
//  - The images will not be attached to any
//    gallery when uploaded
router.post(
  '/image',
  requireRestrictions(Restrictions.WRITE_IMAGES | Restrictions.WRITE_GALLERY),
  upload.array('photos'),
  async (req, res, next) => {
    if (!Array.isArray(req.files)) {
      next(new Error('files is not an array'));
      return;
    }
    try {
      await handleImages(req.session, req.files, 'undefined');
      res.status(202).send();
    } catch (error) {
      next(error);
    }
  }
);

// Upload images to a specific gallery
//  - Author is always the logged-in User
//  - The images will be added to the gallery
//    automatically.
router.post(
  '/image/:galleryId',
  requireRestrictions(Restrictions.WRITE_IMAGES),
  upload.array('photos'),
  async (req, res, next) => {
    const galleryId = req.params.galleryId;
    if (!Array.isArray(req.files)) {
      next(new Error('files is not an array'));
      return;
    }
    // Validate the gallery
    try {
      await Gallery.findById(galleryId);
      Logger.info(`Preparing upload of files to gallery ${galleryId}`);
      await handleImages(req.session, req.files, galleryId);
    } catch (error) {
      next(error);
    }
    res.status(202).send();
  }
);

/**
 * Updates the author retroactively on all images
 * uploaded by a certain user
 * @param {string} cid
 * @param {string} author
 */
export async function updateAuthorOfImagesUploadedByCid(cid, author) {
  const updated = { author: author };
  const images = await Image.find({ authorCid: cid });
  for (const image of images) {
    await Image.findOneAndUpdate({ _id: image._id }, { $set: updated });
  }
}

// Delete a specific image
//  - Note: this automatically removes all gallery
//          associations.
router.delete(
  '/image/:id',
  requireRestrictions(Restrictions.WRITE_IMAGES | Restrictions.WRITE_GALLERY),
  async (req, res, next) => {
    const id = req.params.id;
    try {
      const image = await Image.findByIdAndRemove(id);

      Logger.info(`User ${req.session.user.cid} removed image ${id}`);

      res.status(202).send();
    } catch (error) {
      next(error);
    }
  }
);
