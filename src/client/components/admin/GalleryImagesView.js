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
      <p> Tänk på att när du laddar upp bilder kan det ta någon minut innan de dyker upp nedan. Det är för att de måste
      hanteras utav servern innan de kan användas. </p>
      <hr/>
      <div className="image-list">
        { images }
      </div>
    </div>
  );
});

export default GalleryImagesView;
