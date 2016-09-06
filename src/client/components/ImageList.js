import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';

class ImageCard extends React.Component {
  render() {
    const thumbnail = this.props.image.thumbnail;
    const imageViewLink = `/gallery/${this.props.image.galleryId}/image/${this.props.image.id}`;
    
    return (
      <div className="image-card">
        <Link to={ imageViewLink }>
          <img src={ thumbnail } />
        </Link>
      </div>
    );
  }
}

@observer
class ImageList extends React.Component {
  render() {
    const images = _.map(this.props.images, (image => {
      return (<ImageCard key={ image.id } image={ image } />);
    }).bind(this));
    
    return (
      <div className="image-list">
        { images }
      </div>
    );
  }
}

export default ImageList;