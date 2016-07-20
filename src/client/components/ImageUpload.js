import React from 'react';

export default class ImageUpload extends React.Component {
  render() {
    return (
      <form encType="multipart/form-data" action="/v1/image" method="post">
        <h1> Ladda upp bilder </h1>
        <input type="file" className="u-full-width" name="photos" accept="image/*" multiple />
        <input className="button-primary button-orange" type="submit" value="Upload" name="submit" />
      </form>
    );
  }
}