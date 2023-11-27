import React from 'react';
import { observer } from 'mobx-react';

import { map } from 'lodash-es';

class ImageCard extends React.Component {
  render() {
    const thumbnail = this.props.image.thumbnail;

    const imageViewLink = `/gallery/${this.props.image.galleryId}/image/${this.props.image.id}`;

    return (
      <div className="image-card">
        <a href={imageViewLink} target="_blank">
          <img
            onLoad={this.props.onLoaded}
            src={thumbnail}
            onClick={this.props.onClick}
            loading="lazy"
          />
        </a>
      </div>
    );
  }
}

@observer
class ImageList extends React.Component {
  constructor(props) {
    super(props);

    const images = props.images;
    const totalImageCount = images == undefined ? 0 : images.length;

    this.state = {
      totalImageCount: totalImageCount,
      imageLoadedCount: 0,
    };
  }

  componentWillReceiveProps(newProps, oldProps) {
    const images = newProps.images;
    if (images != undefined) {
      const totalImageCount = images == undefined ? 0 : images.length;
      this.setState({
        totalImageCount: totalImageCount,
      });
    }
  }

  onImageLoaded() {
    const newCount = this.state.imageLoadedCount + 1;
    this.setState({ imageLoadedCount: newCount });
    this.props.onAllLoaded();
  }

  render() {
    const images = map(
      this.props.images,
      ((image) => {
        return (
          <ImageCard
            onLoaded={this.onImageLoaded.bind(this)}
            key={image.id}
            image={image}
            onClick={() => this.props.onImageClick(image)}
          />
        );
      }).bind(this)
    );

    return <div className="image-list">{images}</div>;
  }
}

export default ImageList;
