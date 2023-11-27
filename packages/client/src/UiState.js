import { observable, action } from 'mobx';

import User from './User';
import GalleryStore from './GalleryStore';
import ImageStore from './ImageStore';

class UiState {
  @observable accessor user = new User();
  @observable accessor galleryStore = new GalleryStore();
  @observable accessor imageStore = new ImageStore();

  @observable accessor oldScrollPosition = 0;
  @observable accessor lastGalleryIdViewed = '';

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

const state = new UiState();
export default state;
