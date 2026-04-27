const _ = require('lodash');
const { randomUUID } = require('crypto');
const { Router, json } = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const { inHTMLData } = require('xss-filters');
const exifParser = require('exif-parser');
const moment = require('moment');

const { Restrictions } = require('../model/user-roles');
const { requireRestrictions, hasRestrictions } = require('./permissions');
const Logger = require('../logger');
const config = require('../config');
const { abortOnError } = require('../utils');

const jsonParser = json();


const Image = require('../model/image');
const ImageTag = require('../model/image-tag');
const Gallery = require('../model/gallery');
const { IMAGE_LIST_FIELDS, searchImagesByTag } = require('../services/tag-search');


const router = Router();
module.exports = router;

const GALLERY_IMAGE_PAGE_SIZE = 80;
const MAX_GALLERY_IMAGE_PAGE_SIZE = 200;

function updateAuthorOfImagesUploadedByCid(cid, filteredAuthorName) {
  Image.updateMany(
    { authorCid: cid },
    { $set: { author: filteredAuthorName } }
  ).catch(err => {
      if (err) {
        Logger.error(`Could not update author name for images uploaded by ${cid}`);
        Logger.error(err);
      }
  });
}

module.exports.updateAuthorOfImagesUploadedByCid = updateAuthorOfImagesUploadedByCid;

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = config.storage.temporaryImagePath;
    cb(null, path);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const filename = `${Date.now()}-${randomUUID()}${extension}`;
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

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getGalleryImagePageOptions(req) {
  const pageNumber = parsePositiveInteger(req.params.pageNumber, 1);
  const requestedLimit = parsePositiveInteger(req.query.limit, GALLERY_IMAGE_PAGE_SIZE);
  const limit = Math.min(requestedLimit, MAX_GALLERY_IMAGE_PAGE_SIZE);

  return {
    pageNumber,
    limit,
    skip: (pageNumber - 1) * limit
  };
}

// Public gallery pages only need lightweight image metadata. This avoids
// shipping EXIF data and filesystem paths for large galleries.
router.get('/image/:galleryId/page/:pageNumber', async (req, res) => {
  const galleryId = req.params.galleryId;
  const { pageNumber, limit, skip } = getGalleryImagePageOptions(req);

  try {
    const [images, totalCount] = await Promise.all([
      Image.find({ galleryId: galleryId })
        .sort('shotAt')
        .skip(skip)
        .limit(limit)
        .select(IMAGE_LIST_FIELDS)
        .lean()
        .exec(),
      Image.countDocuments({ galleryId: galleryId })
    ]);

    res.set('Cache-Control', 'public, max-age=30');
    res.send({
      images,
      page: pageNumber,
      pageSize: limit,
      totalCount,
      hasMore: skip + images.length < totalCount
    });
  } catch (err) {
    abortOnError(err, res);
  }
});

// Public photographer albums are paginated so one prolific uploader cannot
// force the server to serialize thousands of images at once.
router.get('/image/photographer/:cid/page/:pageNumber', async (req, res) => {
  const cid = req.params.cid;
  const { pageNumber, limit, skip } = getGalleryImagePageOptions(req);

  try {
    const [images, totalCount] = await Promise.all([
      Image.find({ authorCid: cid })
        .sort('shotAt')
        .skip(skip)
        .limit(limit)
        .select(IMAGE_LIST_FIELDS)
        .lean()
        .exec(),
      Image.countDocuments({ authorCid: cid })
    ]);

    res.set('Cache-Control', 'public, max-age=30');
    res.send({
      images,
      page: pageNumber,
      pageSize: limit,
      totalCount,
      hasMore: skip + images.length < totalCount
    });
  } catch (err) {
    abortOnError(err, res);
  }
});

// Return all images for a specific gallery
router.get('/image/:galleryId', async (req, res) => {
  const galleryId = req.params.galleryId;

  try {
    const images = await Image.find({galleryId: galleryId}).sort('shotAt').lean().exec();
    res.send(images);
  } catch (err) {
    res.status(500).send(err);
    throw err;
  }
});

router.get('/image/:id/details', async (req,res) => {
  const id = req.params.id;
  try {
    const image = await Image.findById(id).lean().exec();
    res.send(image);
  } catch (err) {
    abortOnError(err, res);
  }
});

function sendCachedImage(res, image, propertyName) {
  if (!image || !image[propertyName]) {
    return res.status(404).end();
  }

  return res.sendFile(image[propertyName], {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

// Return a specific image using an id
router.get('/image/:id/fullSize', (req, res) => {
  const id = req.params.id;

  Image.findById(id).lean().exec().then(image => {
    sendCachedImage(res, image, 'fullSize');
  }).catch(err => {
    res.status(500).send(err);
    throw err;
  });
});

router.get('/image/:id/thumbnail', (req, res) => {
  const id = req.params.id;

  Image.findById(id).lean().exec().then(image => {
    sendCachedImage(res, image, 'thumbnail');
  }).catch(err => {
    res.status(500).send(err);
    throw err;
  });
});

router.get('/image/:id/preview', (req, res) => {
  const id = req.params.id;

  Image.findById(id).lean().exec().then(image => {
    sendCachedImage(res, image, 'preview');
  }).catch(err => {
    res.status(500).send(err);
    throw err;
  });
});

router.get('/image/:id/tags', async (req, res) => {
  const id = req.params.id;
  try {
    const imageTags = await ImageTag.find({ imageId: id }).lean().exec();
    res.send(imageTags);
  } catch (err) {
    abortOnError(err, res);
  }
});

router.get('/image/:id/author', async (req, res) => {
    const id = req.params.id;
    try {
        const image = await Image.findById(id).lean().exec();
        res.send(image ? image.author : undefined);
    } catch (err) {
        abortOnError(err, res);
    }
})


router.post('/image/:id/author-name', jsonParser, async (req, res) => {
    const imageId = req.params.id;
    const {authorName} = req.body;
    const filteredAuthorName = inHTMLData(authorName);

    const canWriteImage = hasRestrictions(
        req,
        Restrictions.WRITE_GALLERY | Restrictions.WRITE_IMAGES
    );

    if (!canWriteImage) {
      res.status(403).end();
      Logger.warn(`User ${_.get(req, 'session.user.cid', 'anonymous')} had insufficient permissions to change author name`);
      return;
    }

    try {
      // Directly update the image with the custom author name
      await Image.findOneAndUpdate({_id: imageId}, {
        $set: {
          author: filteredAuthorName
        }
      });

      console.log(`Changed author to ${filteredAuthorName} for image ${imageId}`);
      res.status(202).end();
    } catch (err) {
      abortOnError(err, res);
    }
});

router.post('/image/:id/gallerythumbnail', async (req, res) => {
  const id = req.params.id;

  const canWriteImage = hasRestrictions(
    req,
    Restrictions.WRITE_GALLERY | Restrictions.WRITE_IMAGES
  );

  if (!canWriteImage) {
    Logger.warn(
      `User ${_.get(req, 'session.user.cid', 'anonymous')} had insufficient permissions to change thumbnail.`
    );
    return res.status(403).end();
  }

  try {
    // Find the image that should be set as thumbnail
    const newThumb = await Image.findOne({ _id: id });

    if (!newThumb) {
      return res.status(404).end();
    }

    // Remove the image that was previously thumbnail
    await Image.updateMany(
      { galleryId: newThumb.galleryId, isGalleryThumbnail: true },
      { $set: { isGalleryThumbnail: false } }
    );

    // Set the new one as thumbnail
    newThumb.isGalleryThumbnail = true;
    const savedThumb = await newThumb.save();

    Logger.info(
      `Changed gallery thumbnail to ${id} for gallery ${newThumb.galleryId}`
    );

    // return updated info so frontend doesn't reload everything
    res.status(200).json({
      galleryId: savedThumb.galleryId,
      imageId: savedThumb._id,
      thumbnailUrl: savedThumb.thumbnail,
      previewUrl: savedThumb.preview,
    });
  } catch (err) {
    abortOnError(err, res);
  }
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
      const filename = randomUUID();
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

router.post('/image/:id/tags', jsonParser, async (req, res) => {
  const imageId = req.params.id;

  const {tagName} = req.body;
  const filteredTagName = inHTMLData(tagName).toLowerCase();

  const imageTagData = {
    imageId: imageId,
    tagName: filteredTagName
  };

  try {
    await ImageTag.create(imageTagData);

    // Now add a duplicate to the images list of tags
    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).end();
    }

    image.tags.push(filteredTagName);
    const newImageTags = image.tags;

    await Image.findOneAndUpdate({ _id: imageId }, {
      $set: {
        tags: newImageTags
      }
    });

    console.log(`Added tag ${filteredTagName} to image ${imageId}`);
    res.status(202).end();
  } catch (err) {
    abortOnError(err, res);
  }
});

router.get('/image/tags/:tagName/search', async (req, res) => {
  try {
    const searchResult = await searchImagesByTag(req.params.tagName);

    res.set('Cache-Control', 'public, max-age=30');
    res.send(searchResult.images);
  } catch (err) {
    abortOnError(err, res);
  }
});

function readExifData(imagePath, cb) {
  fs.open(imagePath, 'r', (status, fd) => {
    if (status) {
      Logger.error(`Could not open ${imagePath} for reading`);
      cb({});
      return;
    }

    const buffer = Buffer.alloc(65635); // 64kb buffer
    fs.read(fd, buffer, 0, 65635, 0, (err, bytesRead) => {
      fs.close(fd, closeErr => {
        if (closeErr) {
          Logger.error(`Could not close ${imagePath} after reading EXIF data`);
        }
      });

      if (err) {
        Logger.error(`Could not read EXIF data from ${imagePath}`);
        cb({});
        return;
      }

      try {
        const parser = exifParser.create(buffer.slice(0, bytesRead));
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
  upload.array('photos'), async (req, res) => {
  const galleryId = req.params.galleryId;

  try {
    await Gallery.findById(galleryId);

    Logger.info(`Preparing upload of files to gallery ${galleryId}`);
    handleImages(req, res, galleryId);
    res.status(202).send();
  } catch (err) {
      res.status(500).send(err);
      throw err;
  }
});



// Delete a specific image
//  - Note: this automatically removes all gallery
//          associations.
router.delete('/image/:id',
  requireRestrictions(Restrictions.WRITE_IMAGES | Restrictions.WRITE_GALLERY),
  async (req, res) => {
  const id = req.params.id;

  try {
    await Image.findByIdAndDelete(id);
    Logger.info(`User ${req.session.user.cid} removed image ${id}`);

    res.status(202).send();
  } catch (err) {
      res.status(500).send(err);
      throw err;
  }
});

// Photo Statistics
router.get('/stats/photos', async (req, res) => {
  try {
    const count = await Image.countDocuments({});
    res.json({ count });
  } catch (err) {
    Logger.error('Error counting images:', err);
    return res.status(500).json({ error: 'Could not count images' });
  }
});
