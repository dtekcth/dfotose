import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {browserHistory} from 'react-router';
import {observer} from 'mobx-react';

import uiState from '../../UiState';
import GalleryImagesView from './GalleryImagesView';

class EditGalleryView extends React.Component {
  constructor(props) {
    super(props);

    const id = _.get(props, 'routeParams.id');
    
    const galleries = uiState.galleryStore.galleries;
    const gallery = _.find(galleries, gallery => gallery.id == id);
    
    var imageList = uiState.imageStore.getImagesForGallery(gallery.id);
    
    this.state = {
      gallery: gallery,
      name: gallery.name,
      description: gallery.description,
      published: gallery.published,
      imageList: imageList
    };
  }

  onChangeName(event) {
    this.setState({ name: event.target.value });
  }

  onChangeDescription(event) {
    this.setState({ description: event.target.value });
  }

  onSave(event) {
    event.preventDefault();

    const newGalleryData = {
      name: this.state.name,
      description: this.state.description
    };
    
    this.state.gallery.update(newGalleryData)
      .then(() => {
        browserHistory.push('/admin/gallery');
      });
  }
  
  onPublishToggle(event) {
    event.preventDefault();
    
    const isPublished = this.state.gallery.published;
    if (isPublished) {
      this.state.gallery.unpublish().then((() => {
        this.setState({ published: false });
      }).bind(this));
    } else {
      this.state.gallery.publish().then((() => {
        this.setState({ published: true });
      }).bind(this));
    }
  }

  render() {
    const isPublished = this.state.published;
    
    return (
      <div>
        <form onSubmit={ this.onSave.bind(this) }>
          <h4> Ändrar galleri: { this.state.gallery.id } </h4>
          <label>Namn på galleri:</label>
          <input className="u-full-width" type="text" value={ this.state.name } onChange={ this.onChangeName.bind(this) } placeholder="namn" />
          <label>Beskrivning utav gallery:</label>
          <textarea className="u-full-width" value={ this.state.description } onChange={ this.onChangeDescription.bind(this) }/>
          <button type="submit" className="button-primary">Spara</button>
          <Link to="/admin/gallery">Tillbaka</Link>
          
          <br/>
          { !isPublished ? <button type="button" className="button-primary" onClick={ this.onPublishToggle.bind(this) }> Publicera </button> : null }
        </form>
        <hr/>
        <GalleryImagesView galleryId={ this.state.gallery.id } imageList={ this.state.imageList } />
      </div>
    );
  }
}

export default EditGalleryView;
