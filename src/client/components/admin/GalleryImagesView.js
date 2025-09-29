import React from 'react';
import { observer } from 'mobx-react';
import UploadImagesForm from './UploadImagesForm';

const GalleryImagesView = observer(({ imageList }) => {
  const onToggleImage = (image) => () => {
    if (image.isMarked) {
      image.unmark();
    } else {
      image.mark();
    }
  };

  const onRemoveClick = () => {
    imageList.removeMarkedImages();
  };

  const onUserChange = (image) => (event) => {
    const newCid = event.target.value;
    image.changeAuthor(newCid);
  };

  const onThumbChange = (image) => async () => {
    try {
      await image.setGalleryThumbnail();

      // Instead of re-fetching all images, just update local state
      imageList.images.forEach((img) => {
        img.isGalleryThumbnail = img.filename === image.filename;
      });
    } catch (err) {
      console.error('Failed to set thumbnail:', err);
    }
  };

  const images = imageList.images.map((image) => {
    const className = image.isMarked ? 'marked' : '';

    return (
      <tr key={image.filename} className={className}>
        <td>
          <input
            type="checkbox"
            checked={image.isMarked}
            onChange={onToggleImage(image)}
          />
        </td>
        <td>
          <input
            type="radio"
            name="is-thumbnail"
            checked={image.isGalleryThumbnail}
            onChange={onThumbChange(image)}
          />
        </td>
        <td>{image.filename}</td>
        <td>
          <img src={image.thumbnail} alt={image.filename} />
        </td>
      </tr>
    );
  });

  return (
    <div>
      <UploadImagesForm galleryImageList={imageList} />

      <hr />
      <b>Markerade bilder: </b>
      <button
        type="button"
        className="button-danger"
        onClick={onRemoveClick}
      >
        Ta bort
      </button>

      <table className="u-full-width admin-image-list">
        <thead>
          <tr>
            <th>#</th>
            <th>Thumbnail</th>
            <th>Filnamn</th>
            <th>Bild</th>
          </tr>
        </thead>
        <tbody>{images}</tbody>
      </table>
    </div>
  );
});

export default GalleryImagesView;
