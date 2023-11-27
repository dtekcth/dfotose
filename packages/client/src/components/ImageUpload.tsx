import { FormEvent, useRef, useState } from 'react';

import axios from 'axios';

export default function ImageUpload() {
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

    axios
      .post('/v1/image', formData, {
        onUploadProgress(progressEvent) {
          const decimalPercentage = progressEvent.loaded / progressEvent.total;
          const percent = Math.round(decimalPercentage * 10000) / 100;

          setPercentDone(percent);
        },
      })
      .catch((err) => {
        console.log('NOOO: ' + err);
      });
  }

  const formUpload = (
    <form onSubmit={onSubmit}>
      <h1> Ladda upp bilder </h1>
      <input
        id="file"
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
      <p>{percentDone}% done</p>
    </div>
  );

  return <div>{isUploading ? progressBar : formUpload}</div>;
}
