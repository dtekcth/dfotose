import _ from 'lodash';
import React from 'react';
import {observer} from 'mobx-react';
import moment from 'moment';

import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import GalleryStore from '../GalleryStore';
import ImageStore from '../ImageStore';
import PreloadContainerFactory from './PreloadContainerFactory';

@observer
class GalleryView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSpinner: true
    };
  }
  
  onAllImagesLoaded() {
    this.setState({ showSpinner: false });
  }
  
  render() {
    const {gallery, images} = this.props;
    
    if (gallery == undefined) {
      return (<p>Galleriet finns inte</p>);
    }
    
    const showSpinner = this.state.showSpinner;
    const date = moment(gallery.shootDate).format("YYYY-MM-DD");
    
    return (
      <div className="gallery-view">
        <div className="title">
          <h2>{ gallery.name } - { date }</h2>
          <p>{ images.length } bilder.<br/> 
             { gallery.description }</p>
        </div>
        <LoadingSpinner visible={ showSpinner } />
        <ImageList images={ images } onAllLoaded={ this.onAllImagesLoaded.bind(this) } />
      </div>
    )
  }
}

const GalleryViewContainer = PreloadContainerFactory((props) => {
  const galleryId = _.get(props, 'params.id');

  const galleryPromise = GalleryStore.fetchGallery(galleryId);
  const imagesPromise = ImageStore.fetchImagesInGallery(galleryId);

  return Promise.all([galleryPromise, imagesPromise]).then(([gallery, images]) => {
    return {
      gallery: gallery,
      galleryId: galleryId,
      images: images
    };
  });
}, GalleryView);

export default GalleryViewContainer;
