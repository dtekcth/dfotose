import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import {withRouter} from '../routerCompat';

import PaginatedArray from '../PaginatedArray';
import PreloadContainerFactory from './PreloadContainerFactory';
import GalleryStore, {Gallery as GalleryModel} from '../GalleryStore';
import {formatDate} from '../formatDate';

const PAGE_SIZE = 28;

function pagePath(pageNumber) {
  return pageNumber <= 1 ? '/' : `/gallery/page/${pageNumber}`;
}

function createPaginatedGalleries(galleries, pageNumber = 1) {
  const galleryModels = galleries.map(gallery => (
    gallery instanceof GalleryModel ? gallery : new GalleryModel(gallery)
  ));
  const paginatedGalleries = new PaginatedArray(galleryModels, PAGE_SIZE);

  paginatedGalleries.setPage(pageNumber);
  return paginatedGalleries;
}

@observer
class Gallery extends React.Component {
  render() {
    const gallery = this.props.gallery;
    
    const thumbnailPreview = gallery.thumbnailPreview;
    const galleryViewLink = `/gallery/${gallery.id}`;
    const date = formatDate(gallery.shootDate);
    
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
    const publishedGalleries = allGalleries
      .filter(gallery => gallery.published === true)
      .map(gallery => {
        return (<Gallery key={ gallery.id } gallery={ gallery } />);
      });
    
    return (
      <div className="gallery-list">
        { publishedGalleries }
      </div>
    )
  }
}

class PaginatedGalleryList extends React.Component {
  static propTypes = {
    paginatedGalleries: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    const pageNumber = props.routeParams?.pageNumber || 1;
    if (pageNumber != 1) {
      this.props.paginatedGalleries.setPage(pageNumber);
    }

    this.handlePopState = (event => {
      const pageNumber = event.state?.pageNumber || 1;
      this.props.paginatedGalleries.setPage(pageNumber);
      this.forceUpdate();
    }).bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    const pageNumber = this.props.routeParams?.pageNumber || 1;

    // Browser history is intentionally client-only so the same component can be
    // rendered on the server without touching the window object.
    window.history.replaceState({ pageNumber: pageNumber }, null, pagePath(Number(pageNumber)));
    window.onpopstate = this.handlePopState;
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    if (window.onpopstate === this.handlePopState) {
      window.onpopstate = null;
    }
  }

  handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      this.nextPage(event);
    } else if (event.key === 'ArrowLeft') {
      this.prevPage(event);
    }
  }

  nextPage(event) {
    event.preventDefault();
    this.props.paginatedGalleries.nextPage()
      .then(this.loadPage.bind(this))
      .catch(() => undefined);
  }

  prevPage(event) {
    event.preventDefault();
    this.props.paginatedGalleries.prevPage()
      .then(this.loadPage.bind(this))
      .catch(() => undefined);
  }

  loadPage(pageNumber) {
    window.history.pushState({ pageNumber: pageNumber }, null, pagePath(pageNumber));
    this.forceUpdate()
  }

  render() {
    const galleries = this.props.paginatedGalleries.currentPageData;
    const currentPage = this.props.paginatedGalleries.currentPage;
    const maxPage = this.props.paginatedGalleries.maxPage;

    return (
      <div>
        <div className="gallery-pagination">
          <a href={ pagePath(currentPage - 1) } onClick={ this.prevPage.bind(this) } type="button">Föregående</a>
          <span>sida { currentPage } / { maxPage } </span>
          <a href={ pagePath(currentPage + 1) } onClick={ this.nextPage.bind(this) } type="button">Nästa</a>
        </div>
        <GalleryList galleries={ galleries } />
      </div>
    );
  }
}

const PaginatedGalleryListContainer = PreloadContainerFactory((props) => {
  return GalleryStore.fetchAllGalleries()
    .then(galleries => {
      return {
        paginatedGalleries: createPaginatedGalleries(galleries, props.routeParams?.pageNumber || 1),
        ...props
      }
    });
}, PaginatedGalleryList, (state, props) => ({
  paginatedGalleries: createPaginatedGalleries(
    state.galleries || [],
    props.routeParams?.pageNumber || state.pageNumber || 1
  )
}));

export default withRouter(PaginatedGalleryListContainer);
