import React from 'react';
import {observer} from 'mobx-react';

import LazyLoad from './LazyLoad';

class ImageCard extends React.Component {
  render() {
    const thumbnail = this.props.image.thumbnail;

    const placeHolder = <img id={ this.props.image.id } />;
    const imageViewLink = `/gallery/${this.props.image.galleryId}/image/${this.props.image.id}`;

    const emptyClick = (event) => {
      event.preventDefault();
    };
    const imageLink = (
      <a href={ imageViewLink } target="_blank" onClick={ emptyClick }>
        <img onLoad={ this.props.onLoaded } src={ thumbnail }
            onClick={ this.props.onClick } />
      </a>
    );

    if (this.props.disableLazyLoad) {
      return (
        <div className="image-card">
          { imageLink }
        </div>
      );
    }

    return (
      <div className="image-card">
        <LazyLoad height={ 200 } offset={ 250 } placeHolder={ placeHolder } >
          { imageLink }
        </LazyLoad>
      </div>
    );
  }
}

@observer
class ImageList extends React.Component {
  constructor(props) {
    super(props);

    const images = props.images;
    const totalImageCount = (images == undefined) ? 0 : images.length;

    this.state = {
      totalImageCount: totalImageCount,
      imageLoadedCount: 0
    }
  }

  componentDidUpdate(prevProps) {
    const images = this.props.images;
    if (images != undefined) {
      const totalImageCount = (images == undefined) ? 0 : images.length;
      if (prevProps.images !== images && this.state.totalImageCount !== totalImageCount) {
        this.setState({
          totalImageCount: totalImageCount
        });
      }
    }
  }

  onImageLoaded() {
    const newCount = this.state.imageLoadedCount + 1;
    this.setState({ imageLoadedCount: newCount });
    this.props.onAllLoaded();
  }

  render() {
    const images = this.props.images.map((image => {
      return (
        <ImageCard
          disableLazyLoad={ this.props.disableLazyLoad }
          onLoaded={ this.onImageLoaded.bind(this) }
          key={ image.id }
          image={ image }
          onClick={ () => this.props.onImageClick(image) }
        />
      );
    }).bind(this));

    return (
      <div className="image-list">
        { images }
      </div>
    );
  }
}

export default ImageList;
