import React from 'react';
import {withRouter} from 'react-router-dom';
import {observer} from 'mobx-react';

import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import uiState from '../UiState';

@observer
class TagSearchView extends React.Component {
  constructor(props) {
    super(props);

    const tag = _.get(props, 'match.params.tag');
    this.state = {
      tag: tag,
      imageList: uiState.imageStore.getImagesForTag(tag),
      showSpinner: true,
      searchInput: ''
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.state.tag != newProps.match.params.tag) {
      const tag = _.get(newProps, 'match.params.tag');
      this.setState({
        tag: tag,
        imageList: uiState.imageStore.getImagesForTag(tag),
        showSpinner: true
      });
    }
  }

  onImageClick(image) {
    const imageViewLink = `/gallery/${image.galleryId}/image/${image.id}`;
    this.props.history.push(imageViewLink);
  }

  onAllImagesLoaded() {
    this.setState({ showSpinner: false });
  }

  onSearch(event) {
    event.preventDefault();

    this.props.history.push(`/image/search/${this.state.searchInput}`);
  }

  onSearchInputChange(event) {
    this.setState({searchInput: event.target.value});
  }

  render() {
    const {tag, showSpinner} = this.state;
    const images = this.state.imageList.images.toJS();

    const hasResults = _.get(images, 'length', 0) != 0;

    return (
      <div className="tag-search-view">
        <form onSubmit={ this.onSearch.bind(this) } className="tag-search-bar">
          <input type="text" placeholder="Sök efter taggar" value={ this.state.searchInput }
                 onChange={ this.onSearchInputChange.bind(this) }/>
          <button type="submit">Sök</button>
        </form>
        <h2>Taggsökning: <span className="tag">{ tag }</span></h2>
        { !hasResults ? <p>Inga resultat hittade.</p> : <LoadingSpinner visible={ showSpinner } /> }
        <ImageList images={ images } onAllLoaded={ this.onAllImagesLoaded.bind(this) } onImageClick={ this.onImageClick.bind(this) } />
      </div>
    )
  }
}

export default withRouter(TagSearchView);
