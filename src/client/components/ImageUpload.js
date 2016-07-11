import React from 'react';

export default class ImageUpload extends React.Component {
  render() {
    return (
      <form className="pure-form pure-form-stacked" encType="multipart/form-data" action="/v1/image" method="post">
        <input type="file" name="photos" accept="image/*" multiple />
        <input className="pure-button pure-button-primary" type="submit" value="Upload" name="submit" />
      </form>
    );
  }
}