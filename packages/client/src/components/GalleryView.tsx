import { observer } from 'mobx-react';
import moment from 'moment';
import { animateScroll } from 'react-scroll';

import { useLoaderData, useNavigate } from 'react-router-dom';
import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import GalleryStore from '../GalleryStore';
import ImageStore from '../ImageStore';
import UiState from '../UiState';
import { useState } from 'react';

export async function loader({ params }) {
  const galleryPromise = GalleryStore.fetchGallery(params.id);
  const imagesPromise = ImageStore.fetchImagesInGallery(params.id);

  const [gallery, images] = await Promise.all([galleryPromise, imagesPromise]);

  return {
    gallery: gallery,
    galleryId: params.id,
    images: images,
  };
}

const GalleryView = observer(() => {
  const { gallery, galleryId, images } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  const [showSpinner, setShowSpinner] = useState(true);
  const navigate = useNavigate();

  function onAllImagesLoaded() {
    if (showSpinner) {
      setShowSpinner(false);

      if (
        UiState.oldScrollPosition != 0 &&
        UiState.lastGalleryIdViewed == gallery.id
      ) {
        animateScroll.scrollTo(UiState.oldScrollPosition, {
          duration: 50,
          delay: 100,
          smooth: false,
        });
      }
    }
  }

  function onImageClick(image) {
    const imageViewLink = `/gallery/${image.galleryId}/image/${image.id}`;
    const top = window.pageYOffset || document.documentElement.scrollTop;

    UiState.updateScrollPosition(top);
    UiState.updateLastGalleryIdViewed(image.galleryId);
    navigate(imageViewLink);
  }

  if (gallery == undefined) {
    return <p>Galleriet finns inte</p>;
  }

  const date = moment(gallery.shootDate).format('YYYY-MM-DD');

  return (
    <div className="gallery-view">
      <div className="title">
        <h2>
          {gallery.name} - {date}
        </h2>
        <p>
          {images.length} bilder.
          <br />
          {gallery.description}
        </p>
      </div>
      <LoadingSpinner visible={showSpinner} />
      <ImageList
        images={images}
        onAllLoaded={onAllImagesLoaded}
        onImageClick={onImageClick}
      />
    </div>
  );
});

export default GalleryView;
