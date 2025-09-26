const _ = require('lodash');
const uuid = require('uuid');
const uuidv4 = uuid.v4;
const { Router } = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const bodyParser = require('body-parser');
const { inHTMLData } = require('xss-filters');
const mongoose = require('mongoose');
const exifParser = require('exif-parser');
const moment = require('moment');

const { Restrictions } = require('../model/user-roles');
const { requireRestrictions, hasRestrictions } = require('./permissions');
const Logger = require('../logger');
const config = require('../config');
const { abortOnError } = require('../utils');

const jsonParser = bodyParser.json();


const Image = require('../model/image');
const ImageTag = require('../model/image-tag');
const Gallery = require('../model/gallery');


const router = Router();
module.exports = router;

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

  Image.find({galleryId: galleryId}).sort('shotAt').exec((err, images) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }

    res.send(images);
  });
});

router.get('/image/:id/details', (req,res) => {
  const id = req.params.id;
  Image.findById(id, (err, image) => {
    abortOnError(err, res);
    res.send(image);
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

router.get('/image/:id/tags', (req, res) => {
  const id = req.params.id;
  ImageTag.find({ imageId: id }, (err, imageTags) => {
    abortOnError(err, res);

    res.send(imageTags);
  });
});

router.get('/image/:id/author', (req, res) => {
    const id = req.params.id;
    Image.findById(id, (err, image) => {
        abortOnError(err, res);
        res.send(image.author);
    });
})


router.post('/image/:id/author-name', jsonParser, (req, res) => {
    const imageId = req.params.id;
    const {authorName} = req.body;
    const filteredAuthorName = inHTMLData(authorName);

    const canWriteImage = hasRestrictions(
        req,
        Restrictions.WRITE_GALLERY | Restrictions.WRITE_IMAGES
    );

    if (!canWriteImage) {
      res.status(403).end();
      Logger.warn(`User ${req.session.user.cid} had insufficient permissions to change author name`);
      return;
    }

    // Directly update the image with the custom author name
    Image.findOneAndUpdate({_id: imageId}, {
      $set: {
        author: filteredAuthorName
      }
    }, (err) => {
      abortOnError(err, res);

      console.log(`Changed author to ${filteredAuthorName} for image ${imageId}`);
      res.status(202).end();
    });
});

router.post('/image/:id/gallerythumbnail', (req, res) => {
  const id = req.params.id;

  const canWriteImage = hasRestrictions(
    req,
    Restrictions.WRITE_GALLERY | Restrictions.WRITE_IMAGES
  );

  if (!canWriteImage) {
    Logger.warn(
      `User ${req.session.user.cid} had insufficient permissions to change thumbnail.`
    );
    return res.status(403).end();
  }

  // Find the image that should be set as thumbnail
  Image.findOne({ _id: id }, (err, newThumb) => {
    abortOnError(err, res);

    // Remove the image that was previously thumbnail
    Image.updateMany(
      { galleryId: newThumb.galleryId, isGalleryThumbnail: true },
      { $set: { isGalleryThumbnail: false } },
      (err) => {
        abortOnError(err, res);

        // Set the new one as thumbnail
        newThumb.isGalleryThumbnail = true;
        newThumb.save((err, savedThumb) => {
          abortOnError(err, res);

          Logger.info(
            `Changed gallery thumbnail to ${id} for gallery ${newThumb.galleryId}`
          );

          // return updated info so frontend doesn’t reload everything
          res.status(200).json({
            galleryId: savedThumb.galleryId,
            imageId: savedThumb._id,
            thumbnailUrl: savedThumb.thumbnail,
            previewUrl: savedThumb.preview,
          });
        });
      }
    );
  });
});


// helper: simple concurrency limiter
async function runWithLimit(limit, tasks) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const p = task().then(r => {
      executing.splice(executing.indexOf(p), 1);
      return r;
    });
    results.push(p);
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing); // wait until one finishes
    }
  }
  return Promise.all(results);
}

// make readExifData return a promise
function readExifDataPromise(filePath) {
  return new Promise((resolve, reject) => {
    readExifData(filePath, (exif) => {
      if (!exif) return reject(new Error("Could not read EXIF"));
      resolve(exif);
    });
  });
}

async function handleImages(req, res, galleryId) {
  try {
    const userCid = req.session.user.cid;
    const images = req.files;

    const photographerName =
      req.headers["x-photographer-name"] ||
      req.session.user.fullname ||
      req.session.user.cid;

    const galleryPath = path.resolve(config.storage.path, galleryId);

    // ensure dirs once
    await fs.ensureDir(galleryPath);
    await fs.ensureDir(path.resolve(galleryPath, "thumbnails"));
    await fs.ensureDir(path.resolve(galleryPath, "previews"));

    // create tasks
    const tasks = images.map((image) => async () => {
      if (image.fieldname !== "photos") {
        throw new Error("incorrect fieldName specified");
      }

      const extension = path.extname(image.originalname);
      const filename = uuidv4();
      const fullSizeImagePath = path.join(galleryPath, `${filename}${extension}`);

      await fs.move(image.path, fullSizeImagePath);

      const thumbnail = path.join(galleryPath, "thumbnails", `${filename}${extension}`);
      const preview   = path.join(galleryPath, "previews",   `${filename}${extension}`);

      // sharp tasks for this image
      await Promise.all([
        sharp(fullSizeImagePath)
          .resize(300, 200, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
          .rotate()
          .toFile(thumbnail),

        sharp(fullSizeImagePath)
          .resize({ height: 800, fit: sharp.fit.inside })
          .rotate()
          .toFile(preview),
      ]);

      // EXIF
      const exif = await readExifDataPromise(fullSizeImagePath);
      const shotAtUnformatted = _.get(exif, "tags.DateTimeOriginal");
      const shotAt = shotAtUnformatted ? moment(shotAtUnformatted) : moment();

      const newImage = new Image({
        filename,
        authorCid: userCid,
        author: photographerName,
        galleryId,
        thumbnail,
        preview,
        fullSize: fullSizeImagePath,
        shotAt,
        exifData: exif,
      });

      await newImage.save();
      Logger.info(`Saved image ${filename} with author ${photographerName}`);
    });

    // run tasks with concurrency limit (e.g. 5 at a time)
    await runWithLimit(5, tasks);

    Logger.info(`${images.length} new images uploaded by ${req.session.user.cid}`);

  } catch (err) {
    Logger.error(`Image processing failed: ${err && err.message ? err.message : err}`);
    if (err && err.stack) {
      Logger.error(err.stack);
    }
  }
}

router.post('/image/:id/tags', jsonParser, (req, res) => {
  const imageId = req.params.id;

  const {tagName} = req.body;
  const filteredTagName = inHTMLData(tagName).toLowerCase();

  const imageTagData = {
    imageId: imageId,
    tagName: filteredTagName
  };

  var newTag = new ImageTag(imageTagData);
  newTag.save((err) => {
    abortOnError(err, res);

    // Now add a duplicate to the images list of tags
    Image.findById(imageId, (err, image) => {
      abortOnError(err, res);

      image.tags.push(filteredTagName);
      const newImageTags = image.tags;

      Image.findOneAndUpdate({ _id: imageId }, {
        $set: {
          tags: newImageTags
        }
      }, (err) => {
        abortOnError(err, res);

        console.log(`Added tag ${filteredTagName} to image ${imageId}`);
        res.status(202).end();
      });
    });
  });
});

router.get('/image/tags/:tagName/search', (req, res) => {
  const tagName = req.params.tagName.toLowerCase();

  ImageTag.find({ tagName: tagName }, (err, imageTags) => {
    abortOnError(err, res);

    // imageTags contains all of the ids of images we need to send
    // to the client
    const imageObjectIds = _.map(imageTags, tag => {
      return mongoose.Types.ObjectId(tag.imageId);
    });

    Image.find({ '_id': {
      $in: imageObjectIds
    }}, (err, images) => {
      abortOnError(err, res);

      res.send(images);
    });
  });
});

function createDirectoryIfNeeded(dir) {
  try {
    fs.statSync(dir);
  } catch(err) {
    fs.mkdirSync(dir);
  }
}

function readExifData(imagePath, cb) {
  fs.open(imagePath, 'r', (status, fd) => {
    if (status) {
      Logger.error(`Could not open ${imagePath} for reading`);
      return;
    }

    var buffer = new Buffer(65635); // 64kb buffer
    fs.read(fd, buffer, 0, 65635, 0, (err, bytesRead) => {
      if (err) {
        Logger.error(`Could not read EXIF data from ${imagePath}`);
        return;
      }

      try {
        var parser = exifParser.create(buffer);
        const parsed = parser.parse();
        cb(parsed);
      } catch(ex) {
        cb({});
      }
    });
  });
}

router.post('/image',
  requireRestrictions(Restrictions.WRITE_IMAGES | Restrictions.WRITE_GALLERY),
  upload.array('photos', 200), // Limit upload to 200
  (req, res) => {
    handleImages(req, res, 'undefined') 
      .catch(err => Logger.error(err));
    res.status(202).send(); // Accepted, still processing
  }
);


router.post('/image/:galleryId',
  requireRestrictions(Restrictions.WRITE_IMAGES),
  upload.array('photos'), (req, res) => {
  const galleryId = req.params.galleryId;

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
router.delete('/image/:id',
  requireRestrictions(Restrictions.WRITE_IMAGES | Restrictions.WRITE_GALLERY),
  (req, res) => {
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

// Photo Statistics
router.get('/stats/photos', (req, res) => {
  Image.countDocuments({}, (err, count) => {
    if (err) {
      Logger.error('Error counting images:', err);
      return res.status(500).json({ error: 'Could not count images' });
    }
    res.json({ count });
  });
});