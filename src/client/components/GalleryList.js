import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';

@observer
class Gallery extends React.Component {
  render() {
    const gallery = this.props.gallery;
    
    const thumbnailPreview = gallery.thumbnailPreview;
    
    return (
      <div className="gallery-card">
        <Link to="">
          <img src={ thumbnailPreview } />
          <div className="name"><span>{ gallery.name }</span></div>
        </Link>
      </div>
    )
  }
}

@observer
class GalleryList extends React.Component {
  render() {
    const allGalleries = this.props.galleries.Galleries.toJS();
    
    // Filter to ensure all is published, safety precaution
    const publishedGalleries = _.chain(allGalleries)
      .filter({ published: true })
      .map(gallery => {
        return (<Gallery key={ gallery.id } gallery={ gallery } />);
      })
      .value();
    
    return (
      <div className="gallery-list">
        { publishedGalleries }
      </div>
    )
  }
}

export default GalleryList;