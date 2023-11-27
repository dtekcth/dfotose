import { Router } from 'express';
import bodyParser from 'body-parser';

import { Restrictions } from '../model/user-roles.js';
import { requireRestrictions } from './auth-api.js';
import Logger from '../logger.js';

import Gallery from '../model/gallery.js';
import Image from '../model/image.js';
import { get } from 'lodash-es';

const jsonParser = bodyParser.json();

const router = Router();
export default router;

// Return all published galleries
router.get('/gallery', async (req, res, next) => {
  try {
    const galleries = await Gallery.find({ published: true }).sort(
      '-shootDate'
    );
    res.send(galleries);
  } catch (error) {
    next(error);
  }
});

// Return all published galleries with a limit
router.get('/gallery/limit/:limit', async (req, res, next) => {
  const limit = get(req.params, 'limit', 28);
  const nLimit = Number(limit);
  try {
    const galleries = await Gallery.find({ published: true })
      .sort('-shootDate')
      .limit(nLimit);
    res.send(galleries);
  } catch (error) {
    next(error);
  }
});

// Return _all_ galleries, even unpublished
router.get(
  '/gallery/all',
  // WRITE_IMAGES -> then you can add to unpublished galleries and read these
  requireRestrictions(Restrictions.WRITE_IMAGES),
  async (req, res, next) => {
    try {
      const galleries = await Gallery.find({}).sort('-shootDate');
      res.send(galleries);
    } catch (error) {
      next(error);
    }
  }
);

// Return all galleries (only published) _after_ a certain date
// this to enable pagination in the frontend.
router.get('/gallery/after/:startDate/limit/:limit', async (req, res, next) => {
  const { startDate, limit } = req.params;
  const nLimit = Number(limit);

  try {
    const galleries = await Gallery.find({
      published: true,
      shootDate: { $lt: startDate },
    })
      .sort('-shootDate')
      .limit(nLimit);

    res.send(galleries);
  } catch (error) {
    next(error);
  }
});

// Return all galleries (only published) _before_ a certain date
// this to enable pagination in the frontend.
router.get(
  '/gallery/before/:startDate/limit/:limit',
  async (req, res, next) => {
    const { startDate, limit } = req.params;
    const nLimit = Number(limit);
    try {
      const galleries = await Gallery.find({
        published: true,
        shootDate: { $gt: startDate },
      })
        .sort('shootDate')
        .limit(nLimit);

      res.send(galleries);
    } catch (error) {
      next(error);
    }
  }
);

// Return the count of all galleries
router.get('/gallery/count', async (req, res, next) => {
  try {
    const count = await Gallery.countDocuments({ published: true });
    res.send({ count: count });
  } catch (error) {
    next(error);
  }
});

// Return a specific gallery
router.get('/gallery/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const gallery = await Gallery.findById(id);
    res.send(gallery);
  } catch (error) {
    next(error);
  }
});

// Return the thumbnail preview for this particular
// gallery
router.get('/gallery/:id/thumbnail-preview', async (req, res, next) => {
  const id = req.params.id;

  try {
    let image = await Image.findOne({
      galleryId: id,
      isGalleryThumbnail: true,
    });
    if (image !== null) {
      res.sendFile(image.thumbnail);
      return;
    }
    image = await Image.findOne({ galleryId: id });
    if (image !== null) {
      res.sendFile(image.thumbnail);
      return;
    }
    res.status(200).end();
  } catch (error) {
    next(error);
  }
});

// Create an entirely new gallery
//    - Possibly associate with an event or
//      to restrict it to one gallery per event.
router.post(
  '/gallery',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  jsonParser,
  async (req, res, next) => {
    const galleryData = req.body;

    try {
      let newGallery = new Gallery(galleryData);
      await newGallery.save();
      Logger.info(`New gallery with name ${newGallery.name} created`);

      res.send(newGallery);
    } catch (error) {
      next(error);
    }
  }
);

// Modify an existing gallery
//  - Should not be able to modify authors
//      as they should be set automatically and
//      removed automatically.
router.put(
  '/gallery/:id',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  jsonParser,
  async (req, res, next) => {
    const galleryData = req.body;
    const id = req.params.id;

    try {
      await Gallery.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            name: galleryData.name,
            description: galleryData.description,
            shootDate: galleryData.shootDate,
          },
        }
      );
      res.status(202).end();
    } catch (error) {
      next(error);
    }
  }
);

// Publish a gallery
router.post(
  '/gallery/:id/publish',
  requireRestrictions(Restrictions.PUBLISH_GALLERY),
  async (req, res, next) => {
    const id = req.params.id;
    try {
      await Gallery.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            published: true,
          },
        }
      );
      res.status(202).end();
    } catch (error) {
      next(error);
    }
  }
);

// Unpublish a gallery
router.post(
  '/gallery/:id/unpublish',
  requireRestrictions(Restrictions.PUBLISH_GALLERY),
  async (req, res, next) => {
    const id = req.params.id;

    try {
      await Gallery.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            published: false,
          },
        }
      );
      res.status(202).end();
    } catch (error) {
      next(error);
    }
  }
);

// Remove an entire gallery
//  should not be used ever imho.
router.delete(
  '/gallery/:id',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  async (req, res, next) => {
    const id = req.params.id;

    try {
      await Gallery.findByIdAndRemove(id);
      res.status(202).end();
    } catch (error) {
      next(error);
    }
  }
);
