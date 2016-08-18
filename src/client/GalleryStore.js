import _ from 'lodash';

import axios from 'axios';
import {computed, action,observable} from 'mobx';

class Gallery {
  @observable data;
  
  constructor(galleryData) {
    this.data = galleryData;
  }
  
  @computed get id() {
    return this.data._id;
  }
  
  @computed get name() {
    return this.data.name;
  }
  
  @computed get description() {
    return this.data.description;
  }
  
  @action update(data) {
    _.assign(this.data, data);
    return this.save();
  }
  
  @action save() {
    return axios.put(`/v1/gallery/${this.id}`, this.data, { responseType: 'json' });
  }
  
  @action remove() {
    return axios.delete(`/v1/gallery/${this.id}`);
  }
}

class GalleryStore {
  @observable galleries = [];

  constructor() {
    axios.get('/v1/gallery/all')
      .then((response => {
        this.loadGalleries(response.data);
      }).bind(this))
      .catch(() => {
        axios.get('/v1/gallery')
          .then((response => {
            this.loadGalleries(response.data);
          }).bind(this));
      });
  }
  
  @action loadGalleries(galleryDatas) {
    this.galleries = _.map(galleryDatas, data => {
      return new Gallery(data);
    })
  }

  @action addGallery(name, description) {
    return axios.post('/v1/gallery', { name: name, description: description }, { responseType: 'json' })
      .then((response => {
        const newGallery = new Gallery(response.data);
        this.galleries.push(newGallery);
      }).bind(this));
  }
  
  @action removeGallery(galleryId) {
    const gallery = _.find(this.galleries, gallery => gallery.id == galleryId);
    return gallery.remove().then(() => {
      this.galleries = _.filter(this.galleries, gallery => {
        return gallery._id != galleryId;
      });
    })
  }
  
  @computed get Galleries() {
    return this.galleries;
  }
}

export default GalleryStore;