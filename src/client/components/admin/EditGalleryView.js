import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {browserHistory} from 'react-router';
import moment from 'moment';

import GalleryImagesView from './GalleryImagesView';

import GalleryStore from '../../GalleryStore';
import ImageStore, {ImageGalleryList} from '../../ImageStore';
import PreloadContainerFactory from '../PreloadContainerFactory';

class EditGalleryView extends React.Component {
  constructor(props) {
    super(props);

    const gallery = this.props.gallery;
    const date = moment(gallery.shootDate).format("YYYY-MM-DD");
    this.state = {
      name: gallery.name,
      description: gallery.description,
      published: gallery.published,
      date: date
    };
  }

  onChangeName(event) {
    this.setState({ name: event.target.value });
  }

  onChangeDescription(event) {
    this.setState({ description: event.target.value });
  }

  onChangeDate(event) {
    this.setState({ date: event.target.value });
  }

  onSave(event) {
    event.preventDefault();

    const newGalleryData = {
      name: this.state.name,
      description: this.state.description,
      shootDate: this.state.date
    };
    
    this.props.gallery.update(newGalleryData)
      .then(() => {
        browserHistory.push('/admin/gallery');
      });
  }
  
  onPublishToggle(event) {
    event.preventDefault();
    
    const isPublished = this.state.gallery.published;
    if (isPublished) {
      this.props.gallery.unpublish().then((() => {
        this.setState({ published: false });
      }).bind(this));
    } else {
      this.props.gallery.publish().then((() => {
        this.setState({ published: true });
      }).bind(this));
    }
  }

  render() {
    const isPublished = this.state.published;
    
    return (
      <div>
        <form onSubmit={ this.onSave.bind(this) }>
          <h4> Ändrar galleri: { this.props.gallery.id } </h4>
          <label>Namn på galleri:</label>
          <input className="u-full-width" type="text" value={ this.state.name } onChange={ this.onChangeName.bind(this) } placeholder="namn" />
          <label>Beskrivning utav gallery:</label>
          <textarea className="u-full-width" value={ this.state.description } onChange={ this.onChangeDescription.bind(this) }/>
          <label>Datum för galleri:</label>
          <input className="u-full-width" type="date" value={ this.state.date } onChange={ this.onChangeDate.bind(this) } placeholder="yyyy-mm-dd" />
          <button type="submit" className="button-primary">Spara</button>
          <Link to="/admin/gallery">Tillbaka</Link>
          
          <br/>
          { !isPublished ? <button type="button" className="button-primary" onClick={ this.onPublishToggle.bind(this) }> Publicera </button> : null }
        </form>
        <hr/>
        <GalleryImagesView galleryId={ this.props.gallery.id } imageList={ this.props.imageList } />
      </div>
    );
  }
}

const EditGalleryViewContainer = PreloadContainerFactory((props) => {
  const galleryId = _.get(props, 'params.id');

  const galleryPromise = GalleryStore.fetchGallery(galleryId);
  const imagesPromise = ImageStore.fetchImagesInGallery(galleryId);

  return Promise.all([galleryPromise, imagesPromise]).then(([gallery, images]) => {
    return {
      gallery: gallery,
      galleryId: galleryId,
      imageList: new ImageGalleryList(galleryId, images)
    };
  });
}, EditGalleryView);

export default EditGalleryViewContainer;
