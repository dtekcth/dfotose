import { FormEvent, useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import moment from 'moment';

import GalleryImagesView from './GalleryImagesView';

import GalleryStore from '../../GalleryStore';
import ImageStore, { ImageGalleryList } from '../../ImageStore';

export async function loader({ params }) {
  const galleryPromise = GalleryStore.fetchGallery(params.id);
  const imagesPromise = ImageStore.fetchImagesInGallery(params.id);

  return Promise.all([galleryPromise, imagesPromise]).then(
    ([gallery, images]) => {
      return {
        gallery: gallery,
        galleryId: params.id,
        imageList: new ImageGalleryList(params.id, images),
      };
    }
  );
}

function EditGalleryView() {
  const navigate = useNavigate();
  const { gallery, galleryId, imageList } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  const [name, setName] = useState(gallery.name);
  const [description, setDescription] = useState(gallery.description);
  const [date, setDate] = useState(
    moment(gallery.shootDate).format('YYYY-MM-DD')
  );
  const [published, setPublished] = useState(gallery.published);

  function onChangeName(event: Event) {
    setName((event.target as HTMLInputElement).value);
  }

  function onChangeDescription(event: Event) {
    setDescription((event.target as HTMLInputElement).value);
  }

  function onChangeDate(event: Event) {
    setDate((event.target as HTMLInputElement).value);
  }

  function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newGalleryData = {
      name,
      description,
      date,
    };

    gallery.update(newGalleryData).then(() => {
      navigate('/admin/gallery');
    });
  }

  function onPublishToggle() {
    const isPublished = gallery.published;
    if (isPublished) {
      if (!confirm('Vill du verkligen ta bort den som publikt album?')) {
        return;
      }

      this.props.gallery.unpublish().then(() => {
        setPublished(false);
      });
    } else {
      this.props.gallery.publish().then(() => {
        setPublished(true);
      });
    }
  }

  return (
    <div>
      <form onSubmit={onSave}>
        <h4> Ändrar galleri: {gallery.id} </h4>
        <label>Namn på galleri:</label>
        <input
          className="u-full-width"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="namn"
        />
        <label>Beskrivning utav gallery:</label>
        <textarea
          className="u-full-width"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>Datum för galleri:</label>
        <input
          className="u-full-width"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="yyyy-mm-dd"
        />
        <button type="submit" className="button-primary">
          Spara
        </button>
        <Link to="/admin/gallery">Tillbaka</Link>

        <br />
        {published ? (
          <button
            type="button"
            className="button-primary"
            onClick={onPublishToggle}
          >
            Publicera{' '}
          </button>
        ) : (
          <button
            type="button"
            className="button-primary"
            onClick={onPublishToggle}
          >
            O-Publicera{' '}
          </button>
        )}
      </form>
      <hr />
      <GalleryImagesView imageList={imageList} />
    </div>
  );
}

export default EditGalleryView;
