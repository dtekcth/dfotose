const _ = require('lodash');
const { Router, json } = require('express');

const { Restrictions } = require('../model/user-roles');
const { requireRestrictions } = require('./permissions');
const Logger = require('../logger');
const { abortOnError } = require('../utils');

const Gallery = require('../model/gallery');
const Image = require('../model/image');

const jsonParser = json();

const router = Router();
module.exports = router;

// Return all published galleries
router.get('/gallery', async (req, res) => {
  try {
    const galleries = await Gallery.find({ published: true }).sort('-shootDate').lean().exec();
    res.send(galleries);
  } catch (err) {
    abortOnError(err, res);
  }
});

// Return all published galleries with a limit
router.get('/gallery/limit/:limit', async (req, res) => {
  const limit = _.get(req.params, 'limit', 28);
  const nLimit = Number(limit);

  try {
    const galleries = await Gallery.find({ published: true }).sort('-shootDate').limit(nLimit).lean().exec();
    res.send(galleries);
  } catch (err) {
    abortOnError(err, res);
  }
});

// Return _all_ galleries, even unpublished
router.get('/gallery/all',
  // WRITE_IMAGES -> then you can add to unpublished galleries and read these
  requireRestrictions(Restrictions.WRITE_IMAGES),
  async (req, res) => {
    try {
      const galleries = await Gallery.find({}).sort('-shootDate').lean().exec();
      res.send(galleries);
    } catch (err) {
      abortOnError(err, res);
    }
});

// Return all galleries (only published) _after_ a certain date
// this to enable pagination in the frontend.
router.get('/gallery/after/:startDate/limit/:limit', async (req, res) => {
  const {startDate, limit} = req.params;
  const nLimit = Number(limit);

  try {
    const galleries = await Gallery.find({ published: true, shootDate: { $lt: startDate }})
      .sort('-shootDate')
      .limit(nLimit)
      .lean()
      .exec();
    res.send(galleries);
  } catch (err) {
    abortOnError(err, res);
  }
});

// Return all galleries (only published) _before_ a certain date
// this to enable pagination in the frontend.
router.get('/gallery/before/:startDate/limit/:limit', async (req, res) => {
  const {startDate, limit} = req.params;
  const nLimit = Number(limit);

  try {
    const galleries = await Gallery.find({ published: true, shootDate: { $gt: startDate }})
      .sort('shootDate')
      .limit(nLimit)
      .lean()
      .exec();
    res.send(galleries);
  } catch (err) {
    abortOnError(err, res);
  }
});

// Return the count of all galleries
router.get('/gallery/count', async (req, res) => {
  try {
    const count = await Gallery.countDocuments({ published: true });
    res.send({ count: count });
  } catch (err) {
    abortOnError(err, res);
  }
});

// Return a specific gallery
router.get('/gallery/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const gallery = await Gallery.findById(id).lean().exec();
    res.send(gallery);
  } catch (err) {
    abortOnError(err, res);
  }
});

// Return the thumbnail preview for this particular
// gallery
router.get('/gallery/:id/thumbnail-preview', async (req, res) => {
  const id = req.params.id;

  // Tries to get one image with the given query. If none is found, do the failFun
  const sendOneOrFail = async (query, failFun) => {
    const image = await Image.findOne(query).lean().exec();

    if (image !== null) {
      res.sendFile(image.thumbnail)
    } else {
      return failFun();
    }
  }

  try {
    // Try to get a thumbnail image, else get any image, else return an error
    await sendOneOrFail({galleryId: id, isGalleryThumbnail: true},
        () => sendOneOrFail({galleryId: id}, () => res.status(200).end())
    );
  } catch (err) {
    abortOnError(err, res);
  }

});

// Create an entirely new gallery
//    - Possibly associate with an event or
//      to restrict it to one gallery per event.
router.post('/gallery',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  jsonParser, async (req, res) => {
  const galleryData = req.body;

  try {
    let newGallery = Gallery(galleryData);
    await newGallery.save();

    Logger.info(`New gallery with name ${newGallery.name} created`);

    res.send(newGallery);
  } catch (err) {
    abortOnError(err, res);
  }
});

// Modify an existing gallery
//  - Should not be able to modify authors
//      as they should be set automatically and
//      removed automatically.
router.put('/gallery/:id',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  jsonParser, async (req, res) => {
  const galleryData = req.body;
  const id = req.params.id;

  try {
    await Gallery.findOneAndUpdate({ _id: id }, {
      $set: {
        name: galleryData.name,
        description: galleryData.description,
        shootDate: galleryData.shootDate
      }
    });

    res.status(202).end();
  } catch (err) {
    abortOnError(err, res);
  }
});

// Publish a gallery
router.post('/gallery/:id/publish',
  requireRestrictions(Restrictions.PUBLISH_GALLERY),
  async (req, res) => {
  const id = req.params.id;

  try {
    await Gallery.findOneAndUpdate({_id: id}, {
      $set: {
        published: true
      }
    });

    res.status(202).end();
  } catch (err) {
    abortOnError(err, res);
  }
});

// Unpublish a gallery
router.post('/gallery/:id/unpublish',
  requireRestrictions(Restrictions.PUBLISH_GALLERY),
  async (req, res) => {
  const id = req.params.id;

  try {
    await Gallery.findOneAndUpdate({_id: id}, {
      $set: {
        published: false
      }
    });

    res.status(202).end();
  } catch (err) {
    abortOnError(err, res);
  }
});

// Remove an entire gallery
//  should not be used ever imho.
router.delete('/gallery/:id',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  async (req, res) => {
  const id = req.params.id;

  try {
    const result = await Gallery.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      Logger.warn(`User ${req.session.user.cid} tried to remove missing gallery ${id}`);
      return res.status(404).send({ deleted: false });
    }

    Logger.info(`User ${req.session.user.cid} removed gallery ${id}`);
    res.status(202).send({ deleted: true });
  } catch (err) {
    abortOnError(err, res);
  }
});

router.get('/gallery/:id/authors', async (req, res) => {
  const galleryId = req.params.id;

  try {
    const result = await Image.aggregate([
      { $match: { galleryId: galleryId } },
      { $project: { author: 1, authorCid: 1 } },
      { $group: { _id: null, authors: { $addToSet: { $ifNull: ["$author", "$authorCid"] } } } }
    ]).exec();
    const authors = (result[0] && result[0].authors) || [];
    res.send({ authors });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get authors for all galleries at once
router.get('/galleries/authors', async (req, res) => {
  try {
    const result = await Image.aggregate([
      { $group: { _id: "$galleryId", authors: { $addToSet: { $ifNull: ["$author", "$authorCid"] } } } }
    ]).exec();
    // Convert to a map: { galleryId: [authors] }
    const authorsMap = result.reduce((acc, r) => {
      acc[r._id] = r.authors;
      return acc;
    }, {});

    res.send(authorsMap);
  } catch (err) {
    res.status(500).send(err);
  }
});
