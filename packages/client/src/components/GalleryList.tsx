import React from 'react';

import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import moment from 'moment';

import PaginatedArray from '../PaginatedArray';
import GalleryStore, { Gallery } from '../GalleryStore';

const GalleryViewer = observer(({ gallery }: { gallery: Gallery }) => {
  const thumbnailPreview = gallery.thumbnailPreview;
  const galleryViewLink = `/gallery/${gallery.id}`;
  const date = moment(gallery.shootDate).format('YYYY-MM-DD');

  return (
    <div className="gallery-card">
      <Link to={galleryViewLink}>
        <img src={thumbnailPreview} />
        <div className="title">
          <div className="text">
            <span className="name">{gallery.name}</span>
            <span className="date">{date} </span>
          </div>
        </div>
      </Link>
    </div>
  );
});

const GalleryList = observer(({ galleries }: { galleries: Gallery[] }) => {
  // Filter to ensure all is published, safety precaution
  const publishedGalleries = galleries
    .filter((g) => g.published)
    .map((gallery) => {
      return <GalleryViewer key={gallery.id} gallery={gallery} />;
    });

  return <div className="gallery-list">{publishedGalleries}</div>;
});

export async function loader({ params }) {
  const galleries = await GalleryStore.fetchAllGalleries();
  return {
    paginatedGalleries: new PaginatedArray(galleries, 28),
  };
}

function PaginatedGalleryList() {
  const { paginatedGalleries } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  const navigate = useNavigate();

  function handleKeydown(event: React.KeyboardEvent) {
    if (event.key == 'ArrowRight') {
      nextPage();
    } else if (event.key == 'ArrowLeft') {
      prevPage();
    }
  }

  function nextPage() {
    paginatedGalleries
      .nextPage()
      .then(loadPage)
      .catch(() => undefined);
  }

  function prevPage() {
    paginatedGalleries
      .prevPage()
      .then(loadPage)
      .catch(() => undefined);
  }

  function loadPage(pageNumber: number) {
    navigate(`/gallery/page/${pageNumber}`);
  }

  const galleries = paginatedGalleries.currentPageData;
  const currentPage = paginatedGalleries.currentPage;
  const maxPage = paginatedGalleries.maxPage;

  return (
    <div onKeyDown={handleKeydown}>
      <GalleryList galleries={galleries} />
      <div className="gallery-pagination">
        <a onClick={prevPage} type="button">
          Föregående
        </a>
        <span>
          sida {currentPage} / {maxPage}{' '}
        </span>
        <a onClick={nextPage} type="button">
          Nästa
        </a>
      </div>
    </div>
  );
}

export default PaginatedGalleryList;
