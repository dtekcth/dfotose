import _ from 'lodash';
import React from 'react';
import {observer} from 'mobx-react';

import ImageList from './ImageList';

import uiState from '../UiState';

@observer
class GalleryView extends React.Component {
  constructor(props) {
    super(props);
    
    const id = _.get(props, 'params.id');

    this.state = {
      imageList: uiState.imageStore.getImagesForGallery(id)
    };
  }
  
  render() {
    const id = _.get(this.props, 'params.id');
    const galleries = this.props.galleryStore.galleries.toJS();
    const gallery = _.find(galleries, gallery => gallery.id == id);
    
    if (gallery == undefined) {
      return (<p>Galleriet finns inte</p>);
    }
    
    return (
      <div>
        <h2>{ gallery.name }</h2>
        <p>{ gallery.description }</p>
        <ImageList images={ this.state.imageList.images.toJS() } />
      </div>
    )
  }
}

export default GalleryView;