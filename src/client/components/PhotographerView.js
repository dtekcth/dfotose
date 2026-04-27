import React from 'react';
import {observer} from 'mobx-react';
import {withRouter} from '../routerCompat';

import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import ImageStore, {Image as ImageModel} from '../ImageStore';
import UiState from '../UiState';
import PreloadContainerFactory from './PreloadContainerFactory';

function hydratePhotographerViewState(state) {
  const images = (state.images || []).map(image => (
    image instanceof ImageModel ? image : new ImageModel(image)
  ));

  return {
    cid: state.cid,
    images,
    imagePage: state.imagePage || {
      page: 1,
      pageSize: 80,
      totalCount: images.length,
      hasMore: false
    }
  };
}

@observer
class PhotographerView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      images: props.images || [],
      imagePage: props.imagePage || {
        page: 1,
        pageSize: 80,
        totalCount: (props.images || []).length,
        hasMore: false
      },
      loadingMore: false,
      showSpinner: true
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cid !== this.props.cid) {
      this.setState({
        images: this.props.images || [],
        imagePage: this.props.imagePage || {
          page: 1,
          pageSize: 80,
          totalCount: (this.props.images || []).length,
          hasMore: false
        },
        loadingMore: false,
        showSpinner: true
      });
    }
  }

  onAllImagesLoaded() {
    this.setState({showSpinner: false});
  }

  onImageClick(image) {
    const imageViewLink = `/gallery/${image.galleryId}/image/${image.id}`;
    const top = window.pageYOffset || document.documentElement.scrollTop;

    UiState.updateScrollPosition(top);
    UiState.updateLastGalleryIdViewed(image.galleryId);
    this.props.history.push(imageViewLink);
  }

  loadMoreImages() {
    if (this.state.loadingMore || !this.state.imagePage.hasMore) {
      return;
    }

    const nextPage = this.state.imagePage.page + 1;
    this.setState({loadingMore: true});

    ImageStore.fetchImagesForPhotographerPage(this.props.cid, nextPage, this.state.imagePage.pageSize)
      .then(({images, imagePage}) => {
        this.setState(state => ({
          images: state.images.concat(images),
          imagePage,
          loadingMore: false
        }));
      })
      .catch(() => {
        this.setState({loadingMore: false});
      });
  }

  render() {
    const {cid} = this.props;
    const {images, imagePage, loadingMore} = this.state;

    return (
      <div className="gallery-view">
        <div className="title">
          <h2>Fotograf: {cid}</h2>
          <p>{imagePage.totalCount} bilder.</p>
        </div>
        <LoadingSpinner visible={this.state.showSpinner}/>
        <ImageList
          images={images}
          onAllLoaded={this.onAllImagesLoaded.bind(this)}
          onImageClick={this.onImageClick.bind(this)}
        />
        {imagePage.hasMore ? (
          <div className="gallery-load-more">
            <button type="button" disabled={loadingMore} onClick={this.loadMoreImages.bind(this)}>
              {loadingMore ? 'Laddar...' : 'Visa fler bilder'}
            </button>
            <span>{images.length} / {imagePage.totalCount}</span>
          </div>
        ) : null}
      </div>
    );
  }
}

const PhotographerViewContainer = PreloadContainerFactory((props) => {
  const cid = props.match?.params?.cid;

  return ImageStore.fetchImagesForPhotographerPage(cid).then(imageResult => {
    return {
      cid,
      images: imageResult.images,
      imagePage: imageResult.imagePage
    };
  });
}, PhotographerView, hydratePhotographerViewState);

export default withRouter(PhotographerViewContainer);
