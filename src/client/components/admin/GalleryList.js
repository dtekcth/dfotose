import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import axios from 'axios';
import moment from 'moment';

@observer
class Gallery extends React.Component {
  state = {
    authors: []
  };

  componentDidMount() {
    const { gallery } = this.props;

    // Only fetch authors if gallery has an id
    if (gallery._id) {
      axios.get('/v1/galleries/authors')
        .then(res => this.setState({ authors: res.data[gallery._id] || [] }))
        .catch(err => console.error('Failed to fetch authors:', err));
    }
  }

  render() {
    const { gallery, loadThumbnail, onRemove } = this.props;
    const { authors } = this.state;

    const thumbnailUrl = loadThumbnail ? `/v1/gallery/${gallery._id}/thumbnail-preview` : null;
    const editLink = `/admin/gallery/edit/${gallery._id}`;
    const date = moment(gallery.shootDate).format('YYYY-MM-DD');

    return (
      <Link to={editLink} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
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
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              style={{ width: '120px', height: '80px', objectFit: 'cover', marginRight: '20px', borderRadius: '5px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div style={{ flex: 1 }}>
            <p className="name" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {gallery.name}
              {gallery.published
                ? <span style={{ color: 'green', fontSize: '15px', marginLeft: '10px' }}>Publicerad</span>
                : <span style={{ color: 'orange', fontSize: '15px', marginLeft: '10px' }}>Opublicerad</span>
              }
            </p>
            <p style={{ margin: '5px 0', color: '#999', fontSize: '14px' }}>{date}</p>
            <p style={{ margin: '5px 0', color: '#666' }}>{gallery.description}</p>
            {authors.length > 0 && (
              <p style={{ fontSize: '12px', color: '#888', margin: '5px 0' }}>
                Fotografer: {authors.join(', ')}
              </p>
            )}
          </div>
          <button
            type="button"
            className="button button-danger"
            onClick={onRemove}
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
  state = {
    galleries: [],
    searchString: ''
  };

  componentDidMount() {
    axios.get('/v1/gallery/all')
      .then(res => this.setState({ galleries: res.data }))
      .catch(err => console.error(err));
  }

  renderGallery = (gallery, index) => {
    const loadThumbnail = index < 30;

    return (
      <Gallery
        key={gallery._id}
        gallery={gallery}
        loadThumbnail={loadThumbnail}
        onRemove={this.onRemoveGallery(gallery._id)}
      />
    );
  }

  onSearchChange = (event) => {
    this.setState({ searchString: event.target.value });
  }

  onRemoveGallery = (galleryId) => (event) => {
    event.preventDefault();
    if (window.confirm('Vill du verkligen ta bort detta galleri?')) {
      this.setState(prev => ({
        galleries: prev.galleries.filter(g => g._id !== galleryId)
      }));
    }
  }

  render() {
    const { galleries, searchString } = this.state;
    const filtered = galleries.filter(g => g.name.toLowerCase().includes(searchString.toLowerCase()));

    return (
      <div>
        <p>Totalt {filtered.length} gallerier</p>

        <input
          className="u-full-width"
          type="text"
          placeholder="Sök bland alla gallerier..."
          onChange={this.onSearchChange}
          style={{ marginBottom: '20px' }}
        />

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filtered.length > 0 ? filtered.map(this.renderGallery) : (
            <li style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
              Inga gallerier hittades
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default GalleryList;
