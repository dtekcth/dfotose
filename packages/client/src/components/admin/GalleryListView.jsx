import React from 'react';
import { Link } from 'react-router-dom';

import GalleryList from './GalleryList';
import GalleryStore from '../../GalleryStore';

class GalleryListView extends React.Component {
  render() {
    const store = new GalleryStore(true);

    return (
      <div>
        <h4> Gallerier </h4>
        <Link to="/admin/gallery/new">
          <button type="button">Skapa nytt galleri</button>
        </Link>
        <GalleryList galleries={store} />
      </div>
    );
  }
}

export default GalleryListView;
