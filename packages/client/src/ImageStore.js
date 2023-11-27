import axios from 'axios';
import { filter, get, map } from 'lodash-es';
import { computed, action, observable } from 'mobx';

export class Image {
  @observable accessor data;
  @observable accessor marked = false;

  constructor(data) {
    this.data = data;
  }

  @computed get id() {
    return this.data._id;
  }

  @computed get galleryId() {
    return this.data.galleryId;
  }

  @computed get author() {
    return get(this.data, 'author', this.data.authorCid);
  }

  @computed get authorCid() {
    return this.data.authorCid;
  }

  @computed get isGalleryThumbnail() {
    return get(this.data, 'isGalleryThumbnail', false);
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
    return this.data.tags.toJS();
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
    return axios.get(`/v1/image/${imageId}/details`).then((response) => {
      this.data = response.data;
    });
  }

  @action changeAuthor(newCid) {
    const imageId = this.data._id;
    return axios
      .post(`/v1/image/${imageId}/author`, { newCid: newCid })
      .then(() => {
        // Fetch the newly written parameters
        return axios.get(`/v1/image/${imageId}/author`).then((response) => {
          console.log('New author: ' + response.data);
          this.data.author = response.data;
        });
      });
  }

  @action setGalleryThumbnail() {
    const imageId = this.data._id;
    return axios.post(`/v1/image/${imageId}/gallerythumbnail`, {}).then(
      (() => {
        this.data.isGalleryThumbnail = true;
      }).bind(this)
    );
  }

  @action addTag(tagName) {
    const imageId = this.data._id;

    const imageTag = {
      imageId: imageId,
      tagName: tagName,
    };

    return axios.post(`/v1/image/${imageId}/tags`, imageTag).then(
      (() => {
        this.data.tags.push(tagName);
      }).bind(this)
    );
  }
}

export class ImageGalleryList {
  @observable accessor images = [];
  @observable accessor galleryId = null;

  constructor(galleryId, images) {
    this.galleryId = galleryId;
    this.images = images;
  }

  fetchImages() {
    return axios.get(`/v1/image/${this.galleryId}`).then(
      ((response) => {
        this.images = map(response.data, (data) => {
          return new Image(data);
        });
      }).bind(this)
    );
  }

  @action addImages(formData, progressCallback) {
    const config = {
      onUploadProgress: (event) => {
        const decimalPercentage = event.loaded / event.total;
        const percent = Math.round(decimalPercentage * 10000) / 100;
        progressCallback(percent);
      },
    };

    return axios.post(`/v1/image/${this.galleryId}`, formData, config).then(
      (() => {
        this.fetchImages();
      }).bind(this)
    );
  }

  @action removeMarkedImages() {
    const markedImages = filter(this.images, { isMarked: true });

    const removePromises = map(markedImages, (image) => {
      return axios.delete(`/v1/image/${image.id}`);
    });

    Promise.all(removePromises)
      .then(() => {
        this.images = filter(this.images, { isMarked: false });
      })
      .catch((err) => {
        console.log(err);
        alert('Could not remove images! ' + err);
      });
  }
}

export class ImagesForTagList {
  @observable accessor images = [];
  @observable accessor tag = null;

  constructor(tag) {
    this.tag = tag;
    this.fetchImages();
  }

  fetchImages() {
    axios.get(`/v1/image/tags/${this.tag}/search`).then(
      ((response) => {
        this.images = map(response.data, (data) => {
          return new Image(data);
        });
      }).bind(this)
    );
  }
}

export class ImageStore {
  @action getImagesForTag(tag) {
    return new ImagesForTagList(tag);
  }

  /**
   *
   * @param {string} galleryId
   * @returns {Promise<Image[]>}
   */
  static async fetchImagesInGallery(galleryId) {
    return axios
      .get(`/v1/image/${galleryId}`)
      .then((resp) => map(resp.data, (data) => new Image(data)));
  }
}

export default ImageStore;
