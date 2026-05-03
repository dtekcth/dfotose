import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';
import {withRouter} from '../routerCompat';

import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import uiState from '../UiState';
import {Image as ImageModel} from '../ImageStore';
import {Gallery as GalleryModel} from '../GalleryStore';
import {formatDate} from '../formatDate';

function createLoadedImageList(tag, imageData, galleryData) {
  return {
    tag,
    images: (imageData || []).map(image => (
      image instanceof ImageModel ? image : new ImageModel(image)
    )),
    galleries: (galleryData || []).map(gallery => (
      gallery instanceof GalleryModel ? gallery : new GalleryModel(gallery)
    )),
    loading: false,
    loaded: true,
    error: null
  };
}

function hasMatchingServerState(props) {
  return props.ssrInitialState && props.ssrInitialPath === props.location?.pathname;
}

function getRouteSearchTerm(props) {
  return props.match?.params?.tag || props.match?.params?.cid;
}

@observer
class TagSearchView extends React.Component {
  constructor(props) {
    super(props);

    const tag = getRouteSearchTerm(props);
    const hasServerState = hasMatchingServerState(props);
    this.state = {
      tag: tag,
      imageList: hasServerState
        ? createLoadedImageList(tag, props.ssrInitialState.images, props.ssrInitialState.galleries)
        : uiState.imageStore.getImagesForTag(tag),
      searchInput: ''
    };
  }

  componentDidUpdate(prevProps) {
    const previousTag = getRouteSearchTerm(prevProps);
    const tag = getRouteSearchTerm(this.props);

    if (previousTag != tag) {
      this.setState({
        tag: tag,
        imageList: uiState.imageStore.getImagesForTag(tag)
      });
    }
  }

  onImageClick(image) {
    const imageViewLink = `/gallery/${image.galleryId}/image/${image.id}`;
    this.props.history.push(imageViewLink);
  }

  onAllImagesLoaded() {
    // Image loading is intentionally decoupled from search loading. The search
    // request controls the spinner so cached/broken/lazy thumbnails cannot keep
    // the page stuck in a loading state.
  }

  onSearch(event) {
    event.preventDefault();

    const tag = this.state.searchInput.trim();
    if (tag) {
      this.props.history.push(`/image/search/${encodeURIComponent(tag)}`);
    }
  }

  onSearchInputChange(event) {
    this.setState({searchInput: event.target.value});
  }

  renderGallery(gallery) {
    const galleryViewLink = `/gallery/${gallery.id}`;
    const date = formatDate(gallery.shootDate);

    return (
      <div className="gallery-card" key={ gallery.id }>
        <Link to={ galleryViewLink }>
          <img src={ gallery.thumbnailPreview } />
          <div className="title">
            <div className="text">
              <span className="name">{ gallery.name }</span>
              <span className="date">{ date } </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  render() {
    const {tag} = this.state;
    const imageList = this.state.imageList;
    const images = imageList.images || [];
    const galleries = imageList.galleries || [];
    const headingPrefix = this.props.headingPrefix || 'Taggsökning';

    const hasResults = images.length != 0 || galleries.length != 0;

    return (
      <div className="tag-search-view">
        <form onSubmit={ this.onSearch.bind(this) } className="tag-search-bar">
          <input type="text" placeholder="Sök efter taggar/album" value={ this.state.searchInput }
                 onChange={ this.onSearchInputChange.bind(this) }/>
          <button type="submit">Sök</button>
        </form>
        { tag ? <h2>{headingPrefix}: <span className="tag">{ tag }</span></h2> : null }
        <LoadingSpinner visible={ Boolean(tag && imageList.loading) } />
        { imageList.error ? <p>Kunde inte söka efter taggen.</p> : null }
        { tag && imageList.loaded && !hasResults && !imageList.error ? <p>Inga resultat hittade.</p> : null }
        { galleries.length > 0 ? (
          <React.Fragment>
            <h3>Album</h3>
            <div className="gallery-list tag-search-gallery-list">
              { galleries.map(this.renderGallery) }
            </div>
          </React.Fragment>
        ) : null }
        { images.length > 0 ? <h3>Bilder</h3> : null }
        <ImageList
          disableLazyLoad={ true }
          images={ images }
          onAllLoaded={ this.onAllImagesLoaded.bind(this) }
          onImageClick={ this.onImageClick.bind(this) }
        />
      </div>
    )
  }
}

export default withRouter(TagSearchView);
