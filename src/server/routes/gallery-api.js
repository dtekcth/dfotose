import {Router} from 'express';
import bodyParser from 'body-parser';

import {LoggedInAsDfotoRequired} from './auth-api.js';
import Logger from '../logger';
import {abortOnError} from '../utils';

import Gallery from '../model/gallery';
import Image from '../model/image';

const jsonParser = bodyParser.json();

const router = Router();
export default router;

// Return all published galleries
router.get('/gallery', (req, res) => {
  Gallery.find({ published: true }).sort('-shootDate').exec((err, galleries) => {
    abortOnError(err, res);
    res.send(galleries);
  });
});

// Return all published galleries with a limit
router.get('/gallery/limit/:limit', (req, res) => {
  const {limit} = req.params;
  Gallery.find({ published: true }).sort('-shootDate').limit(limit).exec((err, galleries) => {
    abortOnError(err, res);
    res.send(galleries);
  });
});

// Return _all_ galleries, even unpublished
router.get('/gallery/all', LoggedInAsDfotoRequired, (req, res) => {
  Gallery.find({}).sort('-shootDate').exec((err, galleries) => {
    abortOnError(err, res);
    res.send(galleries);
  });
});

// Return all galleries (only published) _after_ a certain date
// this to enable pagination in the frontend.
router.get('/gallery/after/:startDate/limit/:limit', (req, res) => {
  const {startDate, limit} = req.params;
  Gallery.find({ published: true, shootDate: { $lt: startDate }})
    .sort('-shootDate')
    .limit(limit)
    .exec((err, galleries) => {
      abortOnError(err, res);
      res.send(galleries);
    });
});

// Return all galleries (only published) _before_ a certain date
// this to enable pagination in the frontend.
router.get('/gallery/before/:startDate/limit/:limit', (req, res) => {
  const {startDate, limit} = req.params;
  Gallery.find({ published: true, shootDate: { $gt: startDate }})
    .sort('shootDate')
    .limit(limit)
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

  Image.findOne({galleryId: id}, (err, image) => {
    abortOnError(err, res);
    
    if (image !== null) {
      res.sendFile(image.thumbnail);
    } else {
      res.status(200).end();
    }
  });
});

// Create an entirely new gallery
//    - Possibly associate with an event or
//      to restrict it to one gallery per event.
router.post('/gallery', LoggedInAsDfotoRequired, jsonParser, (req, res) => {
  const galleryData = req.body;

  var newGallery = Gallery(galleryData);
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
router.put('/gallery/:id', LoggedInAsDfotoRequired, jsonParser, (req, res) => {
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
router.post('/gallery/:id/publish', LoggedInAsDfotoRequired, (req, res) => {
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
router.post('/gallery/:id/unpublish', LoggedInAsDfotoRequired, (req, res) => {
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
router.delete('/gallery/:id', LoggedInAsDfotoRequired, (req, res) => {
  const id = req.params.id;
  
  Gallery.remove({ _id: id }, (err) => {
    abortOnError(err);
    res.status(202).end();
  });
});
