const _ = require('lodash');

const Gallery = require('../model/gallery');
const Image = require('../model/image');
const { IMAGE_LIST_FIELDS, searchImagesByTag } = require('./tag-search');

const PAGE_SIZE = 28;
const GALLERY_IMAGE_PAGE_SIZE = 80;

function parsePageNumber(value) {
  const pageNumber = Number.parseInt(value, 10);
  return Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
}

async function getGalleryListData(req) {
  const pageNumber = parsePageNumber(_.get(req, 'params.pageNumber', 1));
  const galleries = await Gallery.find({ published: true })
    .sort('-shootDate')
    .lean()
    .exec();

  return {
    path: req.path,
    galleryList: {
      galleries,
      pageNumber,
      pageSize: PAGE_SIZE
    }
  };
}

async function getGalleryViewData(req) {
  const galleryId = req.params.id;
  const [gallery, images, totalCount] = await Promise.all([
    Gallery.findById(galleryId).lean().exec(),
    Image.find({ galleryId })
      .sort('shotAt')
      .limit(GALLERY_IMAGE_PAGE_SIZE)
      .select(IMAGE_LIST_FIELDS)
      .lean()
      .exec(),
    Image.countDocuments({ galleryId })
  ]);

  return {
    path: req.path,
    galleryView: {
      gallery,
      images,
      imagePage: {
        page: 1,
        pageSize: GALLERY_IMAGE_PAGE_SIZE,
        totalCount,
        hasMore: images.length < totalCount
      }
    }
  };
}

async function getTagSearchData(req) {
  const searchResult = await searchImagesByTag(req.params.tag || req.params.cid);

  return {
    path: req.path,
    tagSearch: {
      tag: searchResult.tag,
      images: searchResult.images,
      limit: searchResult.limit
    }
  };
}

async function getPhotographerViewData(req) {
  const cid = req.params.cid;
  const [images, totalCount] = await Promise.all([
    Image.find({ authorCid: cid })
      .sort('shotAt')
      .limit(GALLERY_IMAGE_PAGE_SIZE)
      .select(IMAGE_LIST_FIELDS)
      .lean()
      .exec(),
    Image.countDocuments({ authorCid: cid })
  ]);

  return {
    path: req.path,
    photographerView: {
      cid,
      images,
      imagePage: {
        page: 1,
        pageSize: GALLERY_IMAGE_PAGE_SIZE,
        totalCount,
        hasMore: images.length < totalCount
      }
    }
  };
}

async function getGallerySsrData(req) {
  if (req.path === '/' || req.path.startsWith('/gallery/page/')) {
    return getGalleryListData(req);
  }

  if (req.path.startsWith('/image/photographer/')) {
    return getPhotographerViewData(req);
  }

  if (req.path.startsWith('/image/search/')) {
    return getTagSearchData(req);
  }

  return getGalleryViewData(req);
}

module.exports = {
  getGallerySsrData
};
