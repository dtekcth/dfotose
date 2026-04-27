import React from 'react';
import {observer} from 'mobx-react';
import {withRouter} from '../routerCompat';

import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import uiState from '../UiState';
import {Image as ImageModel} from '../ImageStore';

function createLoadedImageList(tag, imageData) {
  return {
    tag,
    images: (imageData || []).map(image => (
      image instanceof ImageModel ? image : new ImageModel(image)
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
        ? createLoadedImageList(tag, props.ssrInitialState.images)
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

  render() {
    const {tag} = this.state;
    const imageList = this.state.imageList;
    const images = imageList.images || [];
    const headingPrefix = this.props.headingPrefix || 'Taggsökning';

    const hasResults = images.length != 0;

    return (
      <div className="tag-search-view">
        <form onSubmit={ this.onSearch.bind(this) } className="tag-search-bar">
          <input type="text" placeholder="Sök efter taggar" value={ this.state.searchInput }
                 onChange={ this.onSearchInputChange.bind(this) }/>
          <button type="submit">Sök</button>
        </form>
        { tag ? <h2>{headingPrefix}: <span className="tag">{ tag }</span></h2> : null }
        <LoadingSpinner visible={ Boolean(tag && imageList.loading) } />
        { imageList.error ? <p>Kunde inte söka efter taggen.</p> : null }
        { tag && imageList.loaded && !hasResults && !imageList.error ? <p>Inga resultat hittade.</p> : null }
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
