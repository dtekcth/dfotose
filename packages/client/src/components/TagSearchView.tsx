import { useState } from 'react';
import { observer } from 'mobx-react';

import ImageList from './ImageList';
import LoadingSpinner from './LoadingSpinner';

import uiState from '../UiState';
import { useLoaderData, useNavigate } from 'react-router-dom';

export function loader({ params }) {
  const tag = params.tag;
  const imageList = uiState.imageStore.getImagesForTag(tag);
  return {
    tag: tag,
    imageList: imageList,
  };
}

const TagSearchView = observer(() => {
  const { tag, imageList } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  const navigate = useNavigate();

  const [showSpinner, setShowSpinner] = useState(true);

  function onImageClick(image) {
    const imageViewLink = `/gallery/${image.galleryId}/image/${image.id}`;
    navigate(imageViewLink);
  }

  function onAllImagesLoaded() {
    setShowSpinner(false);
  }

  const images = imageList.images;
  const hasResults = images.length != 0;

  return (
    <div className="tag-search-view">
      <h2>
        Taggsökning: <span className="tag">{tag}</span>
      </h2>
      {!hasResults ? (
        <p>Inga resultat hittade.</p>
      ) : (
        <LoadingSpinner visible={showSpinner} />
      )}
      <ImageList
        images={images}
        onAllLoaded={onAllImagesLoaded}
        onImageClick={onImageClick}
      />
    </div>
  );
});

export default TagSearchView;
