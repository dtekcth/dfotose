import {observable, action} from 'mobx';

import User from './User';
import GalleryStore from './GalleryStore';
import ImageStore from './ImageStore';

class UiState {
  @observable user = new User();
  @observable galleryStore = new GalleryStore();
  @observable imageStore = new ImageStore();

  @observable oldScrollPosition = 0;
  @observable lastGalleryIdViewed = '';

  @action updateScrollPosition(scrollPosition) {
    this.oldScrollPosition = scrollPosition;
  }

  @action updateLastGalleryIdViewed(galleryId) {
    this.lastGalleryIdViewed = galleryId;
  }

  @action refresh() {
    this.galleryStore = new GalleryStore();
  }
}

const state = new UiState;
export default state;
