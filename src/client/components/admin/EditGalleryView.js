import _ from 'lodash';
import React from 'react';
import {Link, withRouter} from 'react-router-dom';
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
      date: date,
      saving: false,
      lastSaved: null
    };

    // Create debounced save function (waits 1 second after typing stops)
    this.debouncedSave = _.debounce(this.autoSave.bind(this), 1000);
  }

  autoSave() {
    this.setState({ saving: true });
    
    const newGalleryData = {
      name: this.state.name,
      description: this.state.description,
      shootDate: this.state.date
    };

    this.props.gallery.update(newGalleryData)
      .then(() => {
        this.setState({ 
          saving: false,
          lastSaved: new Date()
        });
      })
      .catch(() => {
        this.setState({ saving: false });
      });
  }

  onChangeName(event) {
    this.setState({ name: event.target.value });
    this.debouncedSave();
  }

  onChangeDescription(event) {
    this.setState({ description: event.target.value });
    this.debouncedSave();
  }

  onChangeDate(event) {
    this.setState({ date: event.target.value });
    this.debouncedSave();
  }

  onPublishToggle(event) {
    event.preventDefault();

    const isPublished = this.props.gallery.published;
    if (isPublished) {
      if (!confirm('Vill du verkligen ta bort den som publikt album?')) {
        return;
      }

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
    const { saving, lastSaved } = this.state;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4>Ändrar galleri: { this.props.gallery.id }</h4>
          <Link to="/admin/gallery">
            <button type="button" className="button">← Tillbaka till gallerier</button>
          </Link>
        </div>

        {saving && <span style={{ color: '#888' }}>Sparar...</span>}
        {!saving && lastSaved && (
          <span style={{ color: 'green', fontSize: '14px' }}>
            ✓ Autosparat {moment(lastSaved).format('HH:mm:ss')}
          </span>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <label>Namn på galleri:</label>
          <input 
            className="u-full-width" 
            type="text" 
            value={ this.state.name } 
            onChange={ this.onChangeName.bind(this) } 
            placeholder="namn" 
          />
          
          <label>Beskrivning utav gallery:</label>
          <textarea 
            className="u-full-width" 
            value={ this.state.description } 
            onChange={ this.onChangeDescription.bind(this) }
          />
          
          <label>Datum för galleri:</label>
          <input 
            className="u-full-width" 
            type="date" 
            value={ this.state.date } 
            onChange={ this.onChangeDate.bind(this) } 
            placeholder="yyyy-mm-dd" 
          />

          <div style={{ marginTop: '20px' }}>
            { !isPublished ?
              <button type="button" className="button-primary" onClick={ this.onPublishToggle.bind(this) }>
                Publicera
              </button>
              :
              <button type="button" className="button-primary" onClick={ this.onPublishToggle.bind(this) }>
                O-Publicera
              </button>
            }
          </div>
        </form>
        
        <hr/>
        <GalleryImagesView galleryId={ this.props.gallery.id } imageList={ this.props.imageList } />
      </div>
    );
  }
}

const EditGalleryViewContainer = PreloadContainerFactory((props) => {
  const galleryId = _.get(props, 'match.params.id');

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

export default withRouter(EditGalleryViewContainer);