import axios from 'axios';
import {computed, action, observable, makeObservable, toJS} from 'mobx';
import {Gallery as GalleryModel} from './GalleryStore';

export class Image {
  @observable data;
  @observable marked = false;

  constructor(data) {
    makeObservable(this);
    this.data = data;
  }

  @computed get id() {
    return this.data._id;
  }

  @computed get galleryId() {
    return this.data.galleryId;
  }

  @computed get author() {
    return this.data.author || this.data.authorCid;
  }

  @computed get authorCid() {
    return this.data.authorCid;
  }

  @computed get isGalleryThumbnail() {
    return this.data.isGalleryThumbnail || false;
  }

  @computed get filename() {
    return this.data.filename;
  }

  @computed get thumbnail() {
    return `/v1/image/${this.data._id}/thumbnail`;
  }

  @computed get fullSize() {
    return `/v1/image/${this.data._id}/fullSize`;
  }

  @computed get preview() {
    return `/v1/image/${this.data._id}/preview`;
  }

  @computed get tags() {
    return toJS(this.data.tags || []);
  }

  @computed get isMarked() {
    return this.marked;
  }

  @action mark() {
    this.marked = true;
  }

  @action unmark() {
    this.marked = false;
  }

  // Updates the whole .data of this image
  @action updateData() {
    const imageId = this.data._id;
    return axios.get(`/v1/image/${imageId}/details`).then(response => {
      this.data = response.data;
    })
  }

  // New method to directly set author name (custom name)
  @action changeAuthor(newAuthorName) {
    const imageId = this.data._id;
    return axios.post(`/v1/image/${imageId}/author-name`, {authorName: newAuthorName}).then(() => {
        // Update the local data immediately
        this.data.author = newAuthorName;
    });
  }

  // Old method for changing author by CID (kept for backwards compatibility)
  @action changeAuthorByCid(newCid) {
    const imageId = this.data._id;
    return axios.post(`/v1/image/${imageId}/author`, {newCid: newCid}).then(() => {
        // Fetch the newly written parameters
        return axios.get(`/v1/image/${imageId}/author`).then(response => {
            console.log("New author: " + response.data);
            this.data.author = response.data;
        });
    });
  }

  @action setGalleryThumbnail() {
    const imageId = this.data._id;
    return axios.post(`/v1/image/${imageId}/gallerythumbnail`, {}).then((() => {
      this.data.isGalleryThumbnail = true;
    }).bind(this));
  }

  @action addTag(tagName) {
    const imageId = this.data._id;

    const imageTag = {
      imageId: imageId,
      tagName: tagName
    };

    return axios.post(`/v1/image/${imageId}/tags`, imageTag)
      .then((() => {
        this.data.tags.push(tagName);
      }).bind(this));
  }
}

export class ImageGalleryList {
  @observable images = [];
  @observable galleryId = null;

  constructor(galleryId, images) {
    makeObservable(this);
    this.galleryId = galleryId;
    this.images = images;
  }

  fetchImages() {
    return axios.get(`/v1/image/${this.galleryId}`)
      .then((response => {
        this.images = response.data.map(data => {
          return new Image(data);
        });
      }).bind(this));
  }

  @action addImages(formData, progressCallback) {
    const config = {
      onUploadProgress: (event => {
        const decimalPercentage = event.loaded / event.total;
        const percent = Math.round(decimalPercentage * 10000) / 100;
        progressCallback(percent);
      })
    };

    return axios.post(`/v1/image/${this.galleryId}`, formData, config)
      .then((() => {
        this.fetchImages();
      }).bind(this));
  }

  @action removeMarkedImages() {
    const markedImages = this.images.filter(image => image.isMarked);

    const removePromises = markedImages.map(image => {
      return axios.delete(`/v1/image/${image.id}`);
    });

    Promise.all(removePromises)
      .then(() => {
        this.images = this.images.filter(image => !image.isMarked);
      })
      .catch(err => {
        console.log(err);
        alert('Could not remove images! ' + err);
      });
  }
}

export class ImagesForTagList {
  @observable images = [];
  @observable galleries = [];
  @observable tag = null;
  @observable loading = false;
  @observable loaded = false;
  @observable error = null;

  constructor(tag) {
    makeObservable(this);
    this.tag = tag;
    if (tag) {
      this.fetchImages();
    }
  }

  fetchImages() {
    if (!this.tag) {
      this.images = [];
      this.galleries = [];
      this.loading = false;
      this.loaded = true;
      return Promise.resolve();
    }

    this.loading = true;
    this.loaded = false;
    this.error = null;

    return axios.get(`/v1/image/tags/${this.tag}/search`)
      .then(action((response) => {
        const searchResult = Array.isArray(response.data)
          ? { images: response.data, galleries: [] }
          : response.data;

        this.images = (searchResult.images || []).map(data => {
          return new Image(data);
        });
        this.galleries = (searchResult.galleries || []).map(data => {
          return new GalleryModel(data);
        });
        this.loading = false;
        this.loaded = true;
      }))
      .catch(action((err) => {
        this.images = [];
        this.galleries = [];
        this.loading = false;
        this.loaded = true;
        this.error = err;
      }));
  }
}

export class ImageStore {
  constructor() {
    makeObservable(this);
  }

  @action getImagesForTag(tag) {
    return new ImagesForTagList(tag);
  }

  static fetchImagesInGallery(galleryId) {
    return axios.get(`/v1/image/${galleryId}`)
      .then((response => {
        const images = response.data.map(data => {
          return new Image(data);
        });

        return Promise.resolve(images);
      }).bind(this));
  }

  static fetchImagesPage(galleryId, pageNumber = 1, pageSize = 80) {
    return axios.get(`/v1/image/${galleryId}/page/${pageNumber}`, {
      params: {
        limit: pageSize
      }
    }).then(response => {
      return {
        images: response.data.images.map(data => new Image(data)),
        imagePage: {
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount,
          hasMore: response.data.hasMore
        }
      };
    });
  }

  static fetchImagesForPhotographerPage(cid, pageNumber = 1, pageSize = 80) {
    return axios.get(`/v1/image/photographer/${encodeURIComponent(cid)}/page/${pageNumber}`, {
      params: {
        limit: pageSize
      }
    }).then(response => {
      return {
        images: response.data.images.map(data => new Image(data)),
        imagePage: {
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount,
          hasMore: response.data.hasMore
        }
      };
    });
  }
}

export default ImageStore;
