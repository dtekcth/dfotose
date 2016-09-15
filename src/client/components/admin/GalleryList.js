import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import {observer} from 'mobx-react';

@observer
class Gallery extends React.Component {
  render() {
    const gallery = this.props.gallery;

    const editLink = `/admin/gallery/edit/${gallery.id}`;
    return (
      <Link to={ editLink }>
        <li>
          <div>
            <p className="name">{ gallery.name }</p>
            <p>{ gallery.description } </p>
          </div>
          <button type="button" className="button button-danger" onClick={ this.props.onRemove }>Ta bort</button>
        </li>
      </Link>
    );
  }
}

@observer
class GalleryList extends React.Component {
  renderGallery(gallery) {
    return (<Gallery key={ gallery.id } gallery={ gallery } onRemove={ this.onRemoveGallery(gallery.id).bind(this) }/>);
  }

  onPublishedSearchChange(event) {
    this.setState({ publishedSearchString: event.target.value });
  }

  onRemoveGallery(galleryId) {
    return event => {
      event.preventDefault();

      if (confirm('Vill du verkligen ta bort detta galleri?')) {
        this.props.galleries.removeGallery(galleryId);
      }
    };
  }

  render() {
    const allGalleries = this.props.galleries.Galleries.toJS();
    const publishedSearchString = _.get(this.state, 'publishedSearchString', '').toLowerCase();

    const unpublishedGalleries = _.chain(allGalleries)
      .filter({ published: false })
      .map(this.renderGallery.bind(this))
      .value();

    const publishedGalleries = _.chain(allGalleries)
      .filter({ published: true })
      .filter(gallery => {
        return gallery.name.toLowerCase().startsWith(publishedSearchString);
      })
      .map(this.renderGallery.bind(this))
      .value();

    return (
      <div>
        <p>Totalt {allGalleries.length} gallerier.</p>
        <h3>Opublicerade gallerier ({unpublishedGalleries.length} st)</h3>
        <ul className="editable-gallery-list">
          {unpublishedGalleries}
        </ul>

        <h3>Publicerade gallerier ({publishedGalleries.length} st)</h3>
        <div>
          Sök: <input className="u-full-width" type="text" placeholder="sök bland publicerade gallerier" onChange={ this.onPublishedSearchChange.bind(this) } />
        </div>
        <ul className="editable-gallery-list">
          {publishedGalleries}
        </ul>
      </div>
    )
  }
}

export default GalleryList;
