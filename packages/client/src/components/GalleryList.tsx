import React, { useEffect } from 'react';

import {
  Link,
  LoaderFunction,
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import { observer } from 'mobx-react';
import moment from 'moment';

import { Gallery, getGalleies } from '../api/gallery';
import { QueryClient, useQuery } from '@tanstack/react-query';

const galleriesListQuery = (page?: number) => ({
  queryKey: ['galleries', page ?? 1],
  queryFn: () => getGalleies(page),
});

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const page = Number(params.page ?? 1);
    await queryClient.prefetchQuery(galleriesListQuery(page));
    return {
      page,
    };
  };

type LoaderData<T extends (...args: any) => LoaderFunction> = Awaited<
  ReturnType<ReturnType<T>>
>;

export default function GalleryList() {
  const { page } = useLoaderData() as LoaderData<typeof loader>;
  const {
    data: { data: galleries, total },
  } = useQuery(galleriesListQuery(page));

  useEffect(() => {
    console.log('gallery', galleries);
  }, [page]);

  const navigate = useNavigate();

  function handleKeydown(event: React.KeyboardEvent) {
    if (event.key == 'ArrowRight') {
      navigate(`/gallery/page/${page + 1}`);
    } else if (event.key == 'ArrowLeft') {
      navigate(`/gallery/page/${page - 1}`);
    }
  }

  return (
    <div onKeyDown={handleKeydown}>
      <div className="gallery-list">
        {galleries.map((gallery) => (
          <GalleryViewer key={gallery._id} gallery={gallery} />
        ))}
      </div>
      <div className="gallery-pagination">
        <Link to={`/gallery/page/${page - 1}`}>Föregående</Link>
        <span>
          sida {page} / {total}{' '}
        </span>
        <Link to={`/gallery/page/${page + 1}`}>Nästa</Link>
      </div>
    </div>
  );
}

const GalleryViewer = ({ gallery }: { gallery: Gallery }) => {
  const thumbnailPreview = `/v1/gallery/${gallery._id}/thumbnail-preview`;
  const galleryViewLink = `/gallery/${gallery._id}`;
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
};
