import React from 'react';
import {Link} from "react-router";

import GalleryList from './GalleryList';

class GalleryListView extends React.Component {
  render() {
    return (
      <div>
        <h4> Gallerier </h4>
        <Link to="/admin/gallery/new"><button type="button">Skapa nytt galleri</button></Link>
        <GalleryList />
      </div>
    );
  }
}

export default GalleryListView;