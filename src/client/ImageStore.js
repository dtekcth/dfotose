import _ from 'lodash';
import axios from 'axios';
import {computed,action,observable} from 'mobx';

export class Image {
  @observable data;

  constructor(data) {
    this.data = data;
  }

  @computed get galleryId() {
    return this.data.galleryId;
  }

  @computed get author() {
    return this.data.authorCid;
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
}

export class ImageGalleryList {
  @observable images = [];
  @observable galleryId = null;
  
  constructor(galleryId) {
    this.galleryId = galleryId;
    this.fetchImages();
  }
  
  @computed get imageThumbnails() {
    return _.map(this.images, image => image.thumbnail);
  }
  
  fetchImages() {
    axios.get(`/v1/image/${this.galleryId}`)
      .then((response => {
        this.images = _.map(response.data, data => {
          return new Image(data);
        });
      }).bind(this));
  }
  
  @action addImages(formData, progressCallback) {
    const config = {
      progress: (event => {
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
}

export class ImageStore {
  @action getImagesForGallery(galleryId) {
    return new ImageGalleryList(galleryId);
  }
}

export default ImageStore;