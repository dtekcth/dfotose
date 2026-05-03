const Gallery = require('../model/gallery');
const Image = require('../model/image');
const ImageTag = require('../model/image-tag');

const TAG_SEARCH_LIMIT = 200;
const IMAGE_LIST_FIELDS = '_id galleryId author authorCid filename isGalleryThumbnail tags shotAt';

function normalizeTag(value) {
  return String(value || '').trim().toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getYearRange(tagName) {
  if (!/^\d{4}$/.test(tagName)) {
    return null;
  }

  const year = Number(tagName);
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1))
  };
}

async function findExplicitTagImages(tagName, limit) {
  const imageTags = await ImageTag.find({ tagName })
    .limit(limit)
    .lean()
    .exec();
  const imageIds = imageTags.map(imageTag => imageTag.imageId);

  if (imageIds.length === 0) {
    return [];
  }

  return Image.find({ _id: { $in: imageIds } })
    .sort('shotAt')
    .select(IMAGE_LIST_FIELDS)
    .lean()
    .exec();
}

async function findGalleryNameImages(tagName, limit) {
  const galleries = await Gallery.find({
    name: new RegExp(`^${escapeRegExp(tagName)}$`, 'i')
  })
    .select('_id')
    .lean()
    .exec();
  const galleryIds = galleries.map(gallery => gallery._id.toString());

  if (galleryIds.length === 0) {
    return [];
  }

  return Image.find({ galleryId: { $in: galleryIds } })
    .sort('shotAt')
    .limit(limit)
    .select(IMAGE_LIST_FIELDS)
    .lean()
    .exec();
}

async function findMatchingGalleries(tagName) {
  return Gallery.find({
    published: true,
    name: new RegExp(escapeRegExp(tagName), 'i')
  })
    .sort('-shootDate')
    .lean()
    .exec();
}

async function findYearImages(tagName, limit) {
  const range = getYearRange(tagName);
  if (!range) {
    return [];
  }

  return Image.find({
    shotAt: {
      $gte: range.start,
      $lt: range.end
    }
  })
    .sort('shotAt')
    .limit(limit)
    .select(IMAGE_LIST_FIELDS)
    .lean()
    .exec();
}

async function findPhotographerImages(tagName, limit) {
  const exactAuthorName = new RegExp(`^${escapeRegExp(tagName)}$`, 'i');

  return Image.find({
    $or: [
      { authorCid: exactAuthorName },
      { author: exactAuthorName }
    ]
  })
    .sort('shotAt')
    .limit(limit)
    .select(IMAGE_LIST_FIELDS)
    .lean()
    .exec();
}

function mergeUniqueImages(imageGroups, limit) {
  const seen = new Set();
  const images = [];

  imageGroups.flat().forEach(image => {
    const id = image._id.toString();
    if (!seen.has(id) && images.length < limit) {
      seen.add(id);
      images.push(image);
    }
  });

  return images.sort((a, b) => new Date(a.shotAt) - new Date(b.shotAt));
}

async function searchImagesByTag(rawTag, limit = TAG_SEARCH_LIMIT) {
  const tagName = normalizeTag(rawTag);
  if (!tagName) {
    return {
      tag: tagName,
      galleries: [],
      images: [],
      limit
    };
  }

  const [galleries, ...imageGroups] = await Promise.all([
    findMatchingGalleries(tagName),
    findExplicitTagImages(tagName, limit),
    findGalleryNameImages(tagName, limit),
    findYearImages(tagName, limit),
    findPhotographerImages(tagName, limit)
  ]);

  return {
    tag: tagName,
    galleries,
    images: mergeUniqueImages(imageGroups, limit),
    limit
  };
}

module.exports = {
  IMAGE_LIST_FIELDS,
  TAG_SEARCH_LIMIT,
  searchImagesByTag
};
