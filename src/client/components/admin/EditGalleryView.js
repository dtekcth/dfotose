import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {browserHistory} from 'react-router';
import {observer} from 'mobx-react';

import uiState from '../../UiState';

class EditGalleryView extends React.Component {
  constructor(props) {
    super(props);

    const id = _.get(props, 'routeParams.id');
    
    const galleries = uiState.galleryStore.galleries;
    const gallery = _.find(galleries, gallery => gallery.id == id);
    this.state = {
      gallery: gallery,
      name: gallery.name,
      description: gallery.description
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

  render() {
    return (
      <form onSubmit={ this.onSave.bind(this) }>
        <h4> Ändrar galleri: { this.state.gallery.id } </h4>
        <label>Namn på galleri:</label>
        <input className="u-full-width" type="text" value={ this.state.name } onChange={ this.onChangeName.bind(this) } placeholder="namn" />
        <label>Beskrivning utav gallery:</label>
        <textarea className="u-full-width" value={ this.state.description } onChange={ this.onChangeDescription.bind(this) }/>
        <button type="submit" className="button-primary">Spara</button>
        <Link to="/admin/gallery">Tillbaka</Link>
      </form>
    );
  }
}

export default EditGalleryView;
