import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';

import uiState from '../../UiState';

@observer
class Gallery extends React.Component {
  render() {
    const gallery = this.props.gallery;
    
    const editLink = `/admin/gallery/edit/${gallery.id}`;
    return (
      <Link to={ editLink }>
        <li>
          <p className="name">{ gallery.name }</p>
          <p>{ gallery.description } </p>
        </li>
      </Link>
    );
  }
} 

@observer
class GalleryList extends React.Component {
  render() {
    const galleries = _.map(uiState.galleryStore.Galleries, gallery => {
      return (<Gallery key={ gallery.id } gallery={ gallery }/>);
    });
    
    return (
      <div>
        Totalt {galleries.length} gallerier.
        <ul className="editable-gallery-list">
          {galleries}
        </ul>
      </div>
    )
  }
}

export default GalleryList;