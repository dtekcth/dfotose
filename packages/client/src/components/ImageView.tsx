import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

import GalleryStore from '../GalleryStore';
import ImageStore from '../ImageStore';

const Image = observer(({ image, onLoaded, onClick }) => (
  <div className="image-container">
    <img
      onLoad={onLoaded}
      onClick={onClick}
      className="primary-image"
      src={image.preview}
    />
  </div>
));

export async function loader({ params }) {
  const galleryPromise = GalleryStore.fetchGallery(params.galleryId);
  const imagesPromise = ImageStore.fetchImagesInGallery(params.galleryId);

  const [gallery, images] = await Promise.all([galleryPromise, imagesPromise]);
  return {
    gallery: gallery,
    galleryId: params.galleryId,
    imageId: params.id,
    images: images,
  };
}

const ImageView = observer(() => {
  const { gallery, galleryId, imageId, images } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  const [newTag, setNewTag] = useState('');
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  const currentImageIndex = images.findIndex((image) => image.id == imageId);
  const currentImage = images[currentImageIndex];

  function handleKeydown(event: React.KeyboardEvent) {
    if (event.key == 'ArrowRight') {
      openNextImage();
    } else if (event.key == 'ArrowLeft') {
      openPrevImage();
    }
  }

  function openNextImage() {
    const nextIndex = (currentImageIndex + 1) % images.length;
    openImage(images[nextIndex].id);
  }

  function openPrevImage() {
    const nextIndex = (currentImageIndex - 1 + images.length) % images.length;
    openImage(images[nextIndex].id);
  }

  function openImage(nextId: string) {
    navigate(`/gallery/${galleryId}/image/${nextId}`);
  }

  function onAddTag(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newTagName = newTag;
    currentImage.addTag(newTagName);

    setNewTag('');
  }

  if (images.length <= 0 || currentImage == undefined) {
    return <LoadingSpinner visible={true} />;
  }

  return (
    <div className="image-view" onKeyDown={handleKeydown}>
      <div className="image-with-buttons">
        <Image
          onLoaded={() => setLoaded(true)}
          onClick={openNextImage}
          image={currentImage}
        />
        <div className="buttons">
          <a href="#" onClick={openPrevImage}>
            Föregående
          </a>
          <div className="middle">
            <span>
              bild {currentImageIndex + 1} / {images.length}{' '}
            </span>
            <Link to={'/gallery/' + galleryId}>Tillbaka till galleriet </Link>
          </div>
          <a href="#" onClick={openNextImage}>
            Nästa
          </a>
        </div>

        {loaded ? (
          <div className="image-loading-spinner">
            <LoadingSpinner visible={loaded} />
          </div>
        ) : null}
      </div>

      <div className="details">
        <span>
          <b>Fotograf</b>: {currentImage.author}
        </span>
        <span>
          <b>Bild-Id</b>: {currentImage.id}
        </span>
        <a href={currentImage.fullSize} target="_blank">
          Öppna bilden i full storlek
        </a>
        <div className="tags">
          <b>Taggar</b>: {currentImage.tags.join(', ')}
        </div>
        <form onSubmit={onAddTag} className="new-tag-form">
          <input
            type="text"
            name="newTag"
            placeholder="ny tagg"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <button type="submit" className="button">
            Lägg till
          </button>
        </form>
      </div>
    </div>
  );
});

export default ImageView;
