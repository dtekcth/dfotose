import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';

@observer
class Image extends React.Component {
  render() {
    const image = this.props.image;
    
    return (
      <div className="image-container">
        <img onClick={this.props.onClick} className="primary-image" src={ image.preview } />
      </div>
    );
  }
}

@observer
class ImageView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      initialImageId: props.imageId,
      imageId: props.imageId
    };
    window.history.replaceState({ imageId: props.imageId }, null, `/gallery/${props.galleryId}/image/${props.imageId}`);
    
    window.onpopstate = (event => {
      const imageId = _.get(event, 'state.imageId', this.state.initialImageId);
      this.setState({ imageId: event.state.imageId });
    }).bind(this);
  }

  openNextImage(event) {
    event.preventDefault();
    
    const images = this.props.images;
    const imageId = this.state.imageId;
    
    const index = _.findIndex(images, {id: imageId});
    const nextIndex = index + 1;
    const insideBounds = nextIndex < images.length && nextIndex >= 0;

    const nextId = insideBounds ? images[nextIndex].id : images[0].id;
    this.openImage(nextId);
  }

  openPrevImage(event) {
    event.preventDefault();
    
    const images = this.props.images;
    const imageId = this.state.imageId;

    const index = _.findIndex(images, {id: imageId});
    const nextIndex = index - 1;
    const insideBounds = nextIndex < images.length && nextIndex >= 0;

    const nextId = insideBounds ? images[nextIndex].id : images[images.length - 1].id;
    this.openImage(nextId);
  }
  
  openImage(nextId) {
    window.history.pushState({ imageId: nextId }, null, `/gallery/${this.props.galleryId}/image/${nextId}`);
    this.setState({imageId: nextId});
  }
  
  render() {
    const images = this.props.images;
    const imageId = this.state.imageId;
    console.log(imageId);
    const currentImage = _.find(images, image => image.id == imageId);
    
    if (images.length <= 0) {
      return (<p>Väntar på att bilden skall laddas ..</p>);
    }
    
    if (currentImage == undefined) {
      return (<p>Kunde inte ladda bilden.</p>);
    }
    
    function clickFullSize(fullSize) {
      return (event) => {
        event.preventDefault();
        window.open(fullSize);
      };
    }
    
    return (
      <div className="image-view">
        <div className="image-with-buttons">
          <Image onClick={ this.openNextImage.bind(this) } image={ currentImage } />
          <div className="buttons">
            <a href="#" onClick={ this.openPrevImage.bind(this) }>Föregående</a>
            <a href="#" onClick={ this.openNextImage.bind(this) }>Nästa</a>
          </div>
        </div>
        
        <div className="details">
          <span>Fotograf: {currentImage.author}</span>
          <span>Bild-Id: {currentImage.id}</span>
          <a href={ currentImage.fullSize } onClick={ clickFullSize(currentImage.fullSize) } target="_blank">Öppna bilden i full storlek</a>
          
          <span>Taggar: plats-för-taggar</span>
        </div>
      </div>
    );
  }
}

export default ImageView;


