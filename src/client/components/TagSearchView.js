import React from 'react';
import {observer} from 'mobx-react';

import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import uiState from '../UiState';

@observer
class TagSearchView extends React.Component {
  constructor(props) {
    super(props);

    const tag = _.get(props, 'params.tag');
    this.state = {
      tag: tag,
      imageList: uiState.imageStore.getImagesForTag(tag),
      showSpinner: true
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.props.tag != newProps.params.tag) {
      const tag = _.get(newProps, 'params.tag');
      this.setState({
        tag: tag,
        imageList: uiState.imageStore.getImagesForTag(tag),
        showSpinner: true
      });
    }
  }

  onAllImagesLoaded() {
    this.setState({ showSpinner: false });
  }

  render() {
    const {tag, showSpinner} = this.state;
    const images = this.state.imageList.images.toJS();

    const hasResults = _.get(images, 'length', 0) != 0;

    return (
      <div className="tag-search-view">
        <h2>Taggsökning: <span className="tag">{ tag }</span></h2>
        { !hasResults ? <p>Inga resultat hittade.</p> : <LoadingSpinner visible={ showSpinner } /> }
        <ImageList images={ images } onAllLoaded={ this.onAllImagesLoaded.bind(this) } />
      </div>
    )
  }
}

export default TagSearchView;
