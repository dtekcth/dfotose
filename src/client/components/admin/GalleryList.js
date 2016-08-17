import axios from 'axios';
import {computed, action,observable} from 'mobx';

class GalleryList {
  @observable galleries = [];

  constructor() {
    axios.get('/v1/gallery/all', null, { responseType: 'json' })
      .then((response => {
        this.galleries = response.data;
      }).bind(this));
  }

  @action addGallery(name, description) {
    return axios.push('/v1/gallery', { name: name, description: description }, { responseType: 'json' })
      .then((response => {
        const newGallery = response.data;
        this.galleries.push(newGallery);
      }).bind(this));
  }
  
  @computed get Galleries() {
    return this.galleries;
  }
}

export default GalleryList;