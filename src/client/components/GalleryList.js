import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';
import moment from 'moment';

@observer
class Gallery extends React.Component {
  render() {
    const gallery = this.props.gallery;
    
    const thumbnailPreview = gallery.thumbnailPreview;
    const galleryViewLink = `/gallery/${gallery.id}`;
    const date = moment(gallery.shootDate).format('YYYY-MM-DD');
    
    return (
      <div className="gallery-card">
        <Link to={ galleryViewLink }>
          <img src={ thumbnailPreview } />
          <div className="title">
            <div className="text">
              <span className="name">{ gallery.name }</span>
              <span className="date">{ date } </span>
            </div>
          </div>
        </Link>
      </div>
    )
  }
}

@observer
class GalleryList extends React.Component {
  render() {
    const allGalleries = this.props.galleries;
    
    // Filter to ensure all is published, safety precaution
    const publishedGalleries = _.chain(allGalleries)
      .filter({ published: true })
      .map(gallery => {
        return (<Gallery key={ gallery.id } gallery={ gallery } />);
      })
      .value();
    
    return (
      <div className="gallery-list">
        { publishedGalleries }
      </div>
    )
  }
}

export default GalleryList;
