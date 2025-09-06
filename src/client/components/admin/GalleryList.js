import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router-dom';
import {observer} from 'mobx-react';
import axios from 'axios';
import moment from 'moment';

@observer
class Gallery extends React.Component {
  state = {
    authors: []
  };

  componentDidMount() {
    // Fetch authors for this gallery
    axios.get(`/v1/gallery/${this.props.gallery.id}/authors`)
      .then(response => {
        this.setState({ authors: response.data.authors });
      })
      .catch(err => console.error('Failed to fetch authors:', err));
  }

  render() {
    const gallery = this.props.gallery;
    const editLink = `/admin/gallery/edit/${gallery.id}`;
    const thumbnailUrl = `/v1/gallery/${gallery.id}/thumbnail-preview`;
    const { authors } = this.state;
    const date = moment(gallery.shootDate).format('YYYY-MM-DD');

    return (
      <Link to={ editLink } style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <li style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '15px', 
          marginBottom: '10px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '5px',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
          e.currentTarget.style.borderColor = '#999';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#ddd';
        }}>
          <img 
            src={ thumbnailUrl } 
            style={{ 
              width: '120px', 
              height: '80px', 
              objectFit: 'cover',
              marginRight: '20px',
              borderRadius: '5px'
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div style={{ flex: 1 }}>
            <p className="name" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              { gallery.name }
              { gallery.published ? 
                <span style={{ color: 'green', fontSize: '15px', marginLeft: '10px' }}>Publicerad</span> : 
                <span style={{ color: 'orange', fontSize: '15px', marginLeft: '10px'}}>Opublicerad</span>
              }
            </p>
            <p style={{ margin: '5px 0', color: '#999', fontSize: '14px' }}>{ date }</p>
            <p style={{ margin: '5px 0', color: '#666' }}>{ gallery.description }</p>
            { authors.length > 0 && (
              <p style={{ fontSize: '12px', color: '#888', margin: '5px 0' }}>
                Fotografer: { authors.join(', ') }
              </p>
            )}
          </div>
          <button 
            type="button" 
            className="button button-danger" 
            onClick={ this.props.onRemove }
            style={{ marginLeft: '10px' }}
          >
            Ta bort
          </button>
        </li>
      </Link>
    );
  }
}

@observer
class GalleryList extends React.Component {
  renderGallery(gallery) {
    return (<Gallery key={ gallery.id } gallery={ gallery } onRemove={ this.onRemoveGallery(gallery.id).bind(this) }/>);
  }

  onSearchChange(event) {
    this.setState({ searchString: event.target.value });
  }

  onRemoveGallery(galleryId) {
    return event => {
      event.preventDefault();

      if (confirm('Vill du verkligen ta bort detta galleri?')) {
        this.props.galleries.removeGallery(galleryId);
      }
    };
  }

  render() {
    const allGalleries = this.props.galleries.Galleries.toJS();
    const searchString = _.get(this.state, 'searchString', '').toLowerCase();

    // Sort all galleries by date (newest first) and filter by search
    const filteredGalleries = _.chain(allGalleries)
      .sortBy('shootDate')
      .reverse()
      .filter(gallery => {
        return searchString === '' || gallery.name.toLowerCase().includes(searchString);
      })
      .map(this.renderGallery.bind(this))
      .value();

    return (
      <div>
        <p>Totalt {allGalleries.length} gallerier</p>
        
        <div style={{ marginBottom: '20px' }}>
          <input 
            className="u-full-width" 
            type="text" 
            placeholder="Sök bland alla gallerier..." 
            onChange={ this.onSearchChange.bind(this) } 
          />
        </div>

        <ul className="editable-gallery-list" style={{ listStyle: 'none', padding: 0 }}>
          {filteredGalleries.length > 0 ? filteredGalleries : 
            <li style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
              Inga gallerier hittades
            </li>
          }
        </ul>
      </div>
    )
  }
}

export default GalleryList;
