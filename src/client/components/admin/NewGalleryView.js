import React from 'react';
import {browserHistory} from 'react-router';

import uiState from '../../UiState';

class NewGalleryView extends React.Component {
  constructor() {
    super();
    
    this.state = {
      name: '',
      description: ''
    }
  }
  
  onChangeName(event) {
    this.setState({ name: event.target.value });
  }
  
  onChangeDescription(event) {
    this.setState({ description: event.target.value });
  }
  
  onSave(event) {
    event.preventDefault();
    
    const {name,description} = this.state;
    uiState.galleryStore.addGallery(name, description)
      .then(() => {
        browserHistory.push('/admin/gallery');
      });
  }
  
  render() {
    return (
      <form onSubmit={ this.onSave.bind(this) }>
        <h4> Nytt galleri </h4>
        <label>Namn på galleri:</label>
        <input className="u-full-width" type="text" value={ this.state.name } onChange={ this.onChangeName.bind(this) } placeholder="namn" />
        <label>Beskrivning utav gallery:</label>
        <textarea className="u-full-width" value={ this.state.description } onChange={ this.onChangeDescription.bind(this) }/>
        <button type="submit" className="button-primary">Spara</button>
      </form>
    );
  }
}

export default NewGalleryView;