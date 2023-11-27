import { FormEvent, useRef, useState } from 'react';
import { ImageGalleryList } from '../../ImageStore';

export default function UploadImagesForm({
  galleryImageList,
}: {
  galleryImageList: ImageGalleryList;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [percentDone, setPercentDone] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    const files = fileInput.current.files;

    for (const file of files) {
      formData.append('photos', file);
    }

    const onProgress = (percent) => {
      setPercentDone(percent);
      if (percent >= 100) {
        setIsUploading(false);
      }
    };

    galleryImageList.addImages(formData, onProgress);
  }
  const formUpload = (
    <form onSubmit={onSubmit}>
      <h1> Ladda upp bilder </h1>
      <input
        ref={fileInput}
        id="image"
        type="file"
        className="u-full-width"
        name="photos"
        accept="image/*"
        multiple
      />
      <input
        className="button-primary button-orange"
        type="submit"
        value="Upload"
        name="submit"
      />
    </form>
  );

  const progressBar = (
    <div>
      <p>Laddar upp: {percentDone}% klart.</p>
    </div>
  );

  return <div>{isUploading ? progressBar : formUpload}</div>;
}
