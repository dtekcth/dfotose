import {Router} from 'express';
import bodyParser from 'body-parser';

import LoggedInRequired from './auth-api.js';
import Logger from '../logger';

import Gallery from '../model/gallery';

const jsonParser = bodyParser.json();

const router = Router();
export default router;

// Return all galleries
router.get('/gallery', (req, res) => {
  Gallery.find({}, (err, galleries) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }
    
    res.send(galleries);
  });
});

// Return a specific gallery
router.get('/gallery/:id', (req, res) => {
  const id = req.params.id;
  
  Gallery.findById(id, (err, gallery) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }

    res.send(gallery);
  });
});

// Create an entirely new gallery
//    - Possibly associate with an event or
//      to restrict it to one gallery per event.
router.post('/gallery', LoggedInRequired, jsonParser, (req, res) => {
  const galleryData = req.body;

  var newGallery = Gallery(galleryData);
  newGallery.save((err) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }

    Logger.info(`New gallery with name ${newGallery.name} created`);

    res.send(newGallery);
  })
});

// Modify an existing gallery
//  - Should not be able to modify authors
//      as they should be set automatically and
//      removed automatically.
router.put('/gallery/:id', LoggedInRequired, jsonParser, (req, res) => {
  const galleryData = req.body;
  const id = req.params.id;

  Gallery.findOneAndUpdate({ _id: id }, {
    $set: {
      name: galleryData.name,
      description: galleryData.description
    }
  }, (err) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }
    
    res.status(202).end();
  });
});

// Remove an entire gallery
//  should not be used ever imho.
router.delete('/gallery/:id', (req, res) => {
  res.status(403).send('not supported');
});
