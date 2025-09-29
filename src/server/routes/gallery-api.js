const _ = require('lodash');
const { Router } = require('express');
const bodyParser = require('body-parser');

const { Restrictions } = require('../model/user-roles');
const { requireRestrictions } = require('./permissions');
const Logger = require('../logger');
const { abortOnError } = require('../utils');

const Gallery = require('../model/gallery');
const Image = require('../model/image');

const jsonParser = bodyParser.json();

const router = Router();
module.exports = router;

// Return all published galleries
router.get('/gallery', (req, res) => {
  Gallery.find({ published: true }).sort('-shootDate').exec((err, galleries) => {
    abortOnError(err, res);
    res.send(galleries);
  });
});

// Return all published galleries with a limit
router.get('/gallery/limit/:limit', (req, res) => {
  const limit = _.get(req.params, 'limit', 28);
  const nLimit = Number(limit);

  Gallery.find({ published: true }).sort('-shootDate').limit(nLimit).exec((err, galleries) => {
    abortOnError(err, res);
    res.send(galleries);
  });
});

// Return _all_ galleries, even unpublished
router.get('/gallery/all',
  // WRITE_IMAGES -> then you can add to unpublished galleries and read these
  requireRestrictions(Restrictions.WRITE_IMAGES),
  (req, res) => {
  Gallery.find({}).sort('-shootDate').exec((err, galleries) => {
    abortOnError(err, res);
    res.send(galleries);
  });
});

// Return all galleries (only published) _after_ a certain date
// this to enable pagination in the frontend.
router.get('/gallery/after/:startDate/limit/:limit', (req, res) => {
  const {startDate, limit} = req.params;
  const nLimit = Number(limit);

  Gallery.find({ published: true, shootDate: { $lt: startDate }})
    .sort('-shootDate')
    .limit(nLimit)
    .exec((err, galleries) => {
      abortOnError(err, res);
      res.send(galleries);
    });
});

// Return all galleries (only published) _before_ a certain date
// this to enable pagination in the frontend.
router.get('/gallery/before/:startDate/limit/:limit', (req, res) => {
  const {startDate, limit} = req.params;
  const nLimit = Number(limit);

  Gallery.find({ published: true, shootDate: { $gt: startDate }})
    .sort('shootDate')
    .limit(nLimit)
    .exec((err, galleries) => {
      abortOnError(err, res);
      res.send(galleries);
    });
});

// Return the count of all galleries
router.get('/gallery/count', (req, res) => {
  Gallery.count({ published: true }, (err, count) => {
    abortOnError(err, res);
    res.send({ count: count });
  });
});

// Return a specific gallery
router.get('/gallery/:id', (req, res) => {
  const id = req.params.id;

  Gallery.findById(id, (err, gallery) => {
    abortOnError(err, res);
    res.send(gallery);
  });
});

// Return the thumbnail preview for this particular
// gallery
router.get('/gallery/:id/thumbnail-preview', (req, res) => {
  const id = req.params.id;

  // Tries to get one image with the given query. If none is found, do the failFun
  const sendOneOrFail = (query, failFun) => {
    Image.findOne(query, (err, image) => {
      abortOnError(err, res);

      if (image !== null) {
        res.sendFile(image.thumbnail)
      } else {
        failFun();
      }
    });
  }

  // Try to get a thumbnail image, else get any image, else return an error
  sendOneOrFail({galleryId: id, isGalleryThumbnail: true},
      () => sendOneOrFail({galleryId: id}, res.status(200).end)
  );

});

// Create an entirely new gallery
//    - Possibly associate with an event or
//      to restrict it to one gallery per event.
router.post('/gallery',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  jsonParser, (req, res) => {
  const galleryData = req.body;

  let newGallery = Gallery(galleryData);
  newGallery.save((err) => {
    abortOnError(err, res);

    Logger.info(`New gallery with name ${newGallery.name} created`);

    res.send(newGallery);
  })
});

// Modify an existing gallery
//  - Should not be able to modify authors
//      as they should be set automatically and
//      removed automatically.
router.put('/gallery/:id',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  jsonParser, (req, res) => {
  const galleryData = req.body;
  const id = req.params.id;

  Gallery.findOneAndUpdate({ _id: id }, {
    $set: {
      name: galleryData.name,
      description: galleryData.description,
      shootDate: galleryData.shootDate
    }
  }, (err) => {
    abortOnError(err, res);

    res.status(202).end();
  });
});

// Publish a gallery
router.post('/gallery/:id/publish',
  requireRestrictions(Restrictions.PUBLISH_GALLERY),
  (req, res) => {
  const id = req.params.id;

  Gallery.findOneAndUpdate({_id: id}, {
    $set: {
      published: true
    }
  }, (err) => {
    abortOnError(err, res);

    res.status(202).end();
  });
});

// Unpublish a gallery
router.post('/gallery/:id/unpublish',
  requireRestrictions(Restrictions.PUBLISH_GALLERY),
  (req, res) => {
  const id = req.params.id;

  Gallery.findOneAndUpdate({_id: id}, {
    $set: {
      published: false
    }
  }, (err) => {
    abortOnError(err, res);

    res.status(202).end();
  });
});

// Remove an entire gallery
//  should not be used ever imho.
router.delete('/gallery/:id',
  requireRestrictions(Restrictions.WRITE_GALLERY),
  (req, res) => {
  const id = req.params.id;

  Gallery.remove({ _id: id }, (err) => {
    abortOnError(err);
    res.status(202).end();
  });
});

router.get('/gallery/:id/authors', (req, res) => {
  const galleryId = req.params.id;

  Image.aggregate([
    { $match: { galleryId: galleryId } },
    { $project: { author: 1, authorCid: 1 } },
    { $group: { _id: null, authors: { $addToSet: { $ifNull: ["$author", "$authorCid"] } } } }
  ]).exec((err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    const authors = (result[0] && result[0].authors) || [];
    res.send({ authors });
  });
});

// Get authors for all galleries at once
router.get('/galleries/authors', (req, res) => {
  Image.aggregate([
    { $group: { _id: "$galleryId", authors: { $addToSet: { $ifNull: ["$author", "$authorCid"] } } } }
  ]).exec((err, result) => {
    if (err) return res.status(500).send(err);

    // Convert to a map: { galleryId: [authors] }
    const authorsMap = result.reduce((acc, r) => {
      acc[r._id] = r.authors;
      return acc;
    }, {});

    res.send(authorsMap);
  });
});
