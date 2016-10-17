import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';
import moment from 'moment';
import keydown, {Keys} from 'react-keydown';

import PaginatedArray from '../PaginatedArray';
import PreloadContainerFactory from './PreloadContainerFactory';
import GalleryStore from '../GalleryStore';

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

class PaginatedGalleryList extends React.Component {
  @keydown(Keys.right)
  nextPage(event) {
    event.preventDefault();
    this.props.paginatedGalleries.nextPage();
  }

  @keydown(Keys.left)
  prevPage(event) {
    event.preventDefault();
    this.props.paginatedGalleries.prevPage();
  }
  
  render() {
    const galleries = this.props.paginatedGalleries.currentPageData();
    const currentPage = this.props.paginatedGalleries.currentPage;
    const maxPage = this.props.paginatedGalleries.maxPage;
    
    return (
      <div>
        <GalleryList galleries={ galleries } />
        <div className="gallery-pagination">
          <a onClick={ this.prevPage } type="button">Föregående</a>
          <span>sida { currentPage } / { maxPage } </span>
          <a onClick={ this.nextPage } type="button">Nästa</a>
        </div>
      </div>
    );
  }
}

const PaginatedGalleryListContainer = PreloadContainerFactory((props) => {
  return GalleryStore.fetchAllGalleries()
    .then(galleries => {
      return {
        paginatedGalleries: new PaginatedArray(galleries, 28)
      }
    });
}, PaginatedGalleryList);

export default PaginatedGalleryListContainer;
