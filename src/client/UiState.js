import {observable, action} from 'mobx';

import User from './User';
import GalleryStore from './GalleryStore';

class UiState {
  @observable user = new User();
  @observable galleryStore = new GalleryStore();
  
  @action refresh() {
    this.galleryStore = new GalleryStore();
  }
}

const state = new UiState;
export default state;