import React from 'react';
import {observer} from 'mobx-react';

import UploadImagesForm from './UploadImagesForm';

const ImageView = observer(({image}) => {
  return (
    <img key={ image.filename } src={ image.thumbnail } />
  );
});

const GalleryImagesView = observer(({imageList}) => {
  const images = _.map(imageList.images.toJS(), image => {
    return (<ImageView image={ image } />);
  });
  
  return (
    <div>
      <UploadImagesForm galleryImageList={ imageList } />
      <hr/>
      <div className="image-list">
        { images }
      </div>
    </div>
  );
});

export default GalleryImagesView;