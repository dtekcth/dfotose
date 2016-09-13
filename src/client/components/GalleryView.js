import _ from 'lodash';
import React from 'react';
import {observer} from 'mobx-react';

import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import uiState from '../UiState';

@observer
class GalleryView extends React.Component {
  constructor(props) {
    super(props);
    
    const id = _.get(props, 'params.id');

    this.state = {
      imageList: uiState.imageStore.getImagesForGallery(id),
      showSpinner: true
    };
  }
  
  onAllImagesLoaded() {
    this.setState({ showSpinner: false });
  }
  
  render() {
    const id = _.get(this.props, 'params.id');
    const galleries = this.props.galleryStore.galleries.toJS();
    const gallery = _.find(galleries, gallery => gallery.id == id);
    
    if (gallery == undefined) {
      return (<p>Galleriet finns inte</p>);
    }
    
    const images = this.state.imageList.images.toJS();
    const showSpinner = this.state.showSpinner;
    
    return (
      <div className="gallery-view">
        <div className="title">
          <h2>{ gallery.name }</h2>
          <p>{ gallery.description }</p>
        </div>
        <LoadingSpinner visible={ showSpinner } />
        <ImageList images={ images } onAllLoaded={ this.onAllImagesLoaded.bind(this) } />
      </div>
    )
  }
}

export default GalleryView;