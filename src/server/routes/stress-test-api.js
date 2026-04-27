const { randomUUID } = require('crypto');
const path = require('path');
const { Router, json } = require('express');
const fs = require('fs-extra');
const sharp = require('sharp');

const Gallery = require('../model/gallery');
const Image = require('../model/image');
const Logger = require('../logger');
const config = require('../config');
const { requireRole } = require('./permissions');
const { abortOnError } = require('../utils');

const router = Router();
const jsonParser = json();

const STRESS_GALLERY_PREFIX = '[Stress Test]';

// Hard caps keep this endpoint useful for stress testing while preventing a
// mistyped form value from queueing an unbounded amount of image generation.
const MAX_GALLERIES = 200;
const MAX_IMAGES_PER_GALLERY = 500;
const MAX_TOTAL_IMAGES = 5000;

function parseCount(value, fallback) {
  const count = Number.parseInt(value, 10);
  return Number.isFinite(count) && count >= 0 ? count : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getRequestCounts(body) {
  const galleryCount = clamp(parseCount(body.galleryCount, 1), 1, MAX_GALLERIES);
  const imagesPerGallery = clamp(parseCount(body.imagesPerGallery, 1), 0, MAX_IMAGES_PER_GALLERY);

  if (galleryCount * imagesPerGallery > MAX_TOTAL_IMAGES) {
    throw new Error(`Stress test is capped at ${MAX_TOTAL_IMAGES} generated images per request.`);
  }

  return { galleryCount, imagesPerGallery };
}

function getStressName(batchId, galleryNumber) {
  return `${STRESS_GALLERY_PREFIX} ${batchId} - Gallery ${galleryNumber}`;
}

function getStressDescription(batchId) {
  return `Generated stress-test gallery. Batch: ${batchId}. Safe to remove from the stress-test admin page.`;
}

function getColor(seed) {
  const hue = (seed * 47) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

async function writeGeneratedImage({ galleryId, galleryIndex, imageIndex, user }) {
  const filename = randomUUID();
  const galleryPath = path.resolve(config.storage.path, galleryId);
  const fullSize = path.join(galleryPath, `${filename}.jpg`);
  const thumbnail = path.join(galleryPath, 'thumbnails', `${filename}.jpg`);
  const preview = path.join(galleryPath, 'previews', `${filename}.jpg`);
  const label = `Gallery ${galleryIndex} / Image ${imageIndex}`;
  const color = getColor(galleryIndex + imageIndex);
  const svg = `
    <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1000" fill="${color}"/>
      <rect x="80" y="80" width="1440" height="840" fill="rgba(0,0,0,0.18)" rx="36"/>
      <text x="800" y="455" font-size="72" font-family="Arial, sans-serif" fill="white" text-anchor="middle">${label}</text>
      <text x="800" y="550" font-size="42" font-family="Arial, sans-serif" fill="white" text-anchor="middle">DFoto stress test</text>
    </svg>
  `;

  // These files follow the same storage contract as real uploads, so gallery
  // pages exercise full-size images, previews and thumbnails during testing.
  await fs.ensureDir(path.join(galleryPath, 'thumbnails'));
  await fs.ensureDir(path.join(galleryPath, 'previews'));

  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(fullSize);
  await Promise.all([
    sharp(fullSize)
      .resize(300, 200, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
      .toFile(thumbnail),
    sharp(fullSize)
      .resize({ height: 800, fit: sharp.fit.inside })
      .toFile(preview)
  ]);

  return {
    filename,
    authorCid: user.cid,
    author: user.fullname || user.cid,
    galleryId,
    thumbnail,
    preview,
    fullSize,
    tags: ['stress-test'],
    shotAt: new Date(Date.now() + imageIndex)
  };
}

router.post('/stress-test/galleries', requireRole('Admin'), jsonParser, async (req, res) => {
  try {
    const { galleryCount, imagesPerGallery } = getRequestCounts(req.body || {});
    const batchId = new Date().toISOString().replace(/[:.]/g, '-');
    const createdGalleries = [];
    let createdImages = 0;

    for (let galleryIndex = 1; galleryIndex <= galleryCount; galleryIndex += 1) {
      const gallery = await Gallery.create({
        name: getStressName(batchId, galleryIndex),
        description: getStressDescription(batchId),
        published: true,
        shootDate: new Date(Date.now() - galleryIndex * 1000)
      });

      const imageData = [];
      for (let imageIndex = 1; imageIndex <= imagesPerGallery; imageIndex += 1) {
        imageData.push(await writeGeneratedImage({
          galleryId: gallery._id.toString(),
          galleryIndex,
          imageIndex,
          user: req.session.user
        }));
      }

      if (imageData.length > 0) {
        imageData[0].isGalleryThumbnail = true;
        await Image.insertMany(imageData);
      }

      createdImages += imageData.length;
      createdGalleries.push({
        id: gallery._id,
        name: gallery.name,
        imageCount: imageData.length
      });
    }

    Logger.info(`${req.session.user.cid} generated ${createdGalleries.length} stress-test galleries with ${createdImages} images`);

    res.status(201).send({
      batchId,
      galleryCount: createdGalleries.length,
      imageCount: createdImages,
      galleries: createdGalleries
    });
  } catch (err) {
    if (err.message && err.message.includes('capped')) {
      return res.status(400).send({ error: err.message });
    }

    return abortOnError(err, res);
  }
});

router.delete('/stress-test/galleries', requireRole('Admin'), async (req, res) => {
  try {
    const galleries = await Gallery.find({ name: new RegExp(`^\\${STRESS_GALLERY_PREFIX}`) }).lean().exec();
    const galleryIds = galleries.map(gallery => gallery._id.toString());

    await Image.deleteMany({ galleryId: { $in: galleryIds } });
    await Gallery.deleteMany({ _id: { $in: galleryIds } });

    // Remove only directories whose ids came from stress-test galleries.
    await Promise.all(galleryIds.map(galleryId => (
      fs.remove(path.resolve(config.storage.path, galleryId))
    )));

    Logger.info(`${req.session.user.cid} removed ${galleryIds.length} stress-test galleries`);

    res.send({
      galleryCount: galleryIds.length
    });
  } catch (err) {
    abortOnError(err, res);
  }
});

module.exports = router;
