import _ from 'lodash';
import axios from 'axios';
import React from 'react';
import {observer} from 'mobx-react';

@observer
class StressTestView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      galleryCount: 5,
      imagesPerGallery: 20,
      loading: false,
      result: null,
      error: null
    };
  }

  updateNumber(name, event) {
    this.setState({
      [name]: event.target.value,
      result: null,
      error: null
    });
  }

  createStressGalleries(event) {
    event.preventDefault();

    const totalImages = Number(this.state.galleryCount) * Number(this.state.imagesPerGallery);
    if (totalImages > 5000) {
      this.setState({ error: 'Max 5000 bilder kan skapas per körning.' });
      return;
    }

    this.setState({ loading: true, result: null, error: null });

    axios.post('/v1/stress-test/galleries', {
      galleryCount: Number(this.state.galleryCount),
      imagesPerGallery: Number(this.state.imagesPerGallery)
    }).then(response => {
      this.setState({
        loading: false,
        result: response.data
      });
    }).catch(error => {
      this.setState({
        loading: false,
        error: _.get(error, 'response.data.error', 'Kunde inte skapa stressdata.')
      });
    });
  }

  removeStressGalleries() {
    if (!window.confirm('Ta bort alla gallerier som skapats av stressverktyget?')) {
      return;
    }

    this.setState({ loading: true, result: null, error: null });

    axios.delete('/v1/stress-test/galleries')
      .then(response => {
        this.setState({
          loading: false,
          result: {
            galleryCount: response.data.galleryCount,
            imageCount: 0,
            removed: true
          }
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          error: 'Kunde inte ta bort stressdata.'
        });
      });
  }

  renderResult() {
    const result = this.state.result;
    if (!result) {
      return null;
    }

    if (result.removed) {
      return <p className="stress-test-success">Tog bort {result.galleryCount} stressgallerier.</p>;
    }

    return (
      <div className="stress-test-success">
        <p>Skapade batch {result.batchId}.</p>
        <p>{result.galleryCount} gallerier och {result.imageCount} bilder skapades.</p>
      </div>
    );
  }

  render() {
    const user = this.props.user;
    if (!user.isLoggedIn || user.role !== 'Admin') {
      return (<p>Du måste vara Admin för att använda stressverktygen.</p>);
    }

    const totalImages = Number(this.state.galleryCount) * Number(this.state.imagesPerGallery);
    const loading = this.state.loading;
    const overLimit = totalImages > 5000;

    return (
      <div className="site-content stress-test-admin">
        <h3>Stressverktyg</h3>
        <p>
          Skapar publicerade testgallerier med genererade bildfiler, thumbnails och previews.
          Använd små värden först eftersom bildgenereringen körs på servern.
        </p>

        <form onSubmit={ this.createStressGalleries.bind(this) }>
          <label>Antal gallerier</label>
          <input
            type="number"
            min="1"
            max="200"
            value={ this.state.galleryCount }
            onChange={ this.updateNumber.bind(this, 'galleryCount') }
          />

          <label>Bilder per galleri</label>
          <input
            type="number"
            min="0"
            max="500"
            value={ this.state.imagesPerGallery }
            onChange={ this.updateNumber.bind(this, 'imagesPerGallery') }
          />

          <p>Totalt: {Number.isFinite(totalImages) ? totalImages : 0} bilder. Max per körning: 5000.</p>
          {overLimit ? <p className="stress-test-error">Sänk antalet. Servern tillåter max 5000 bilder per körning.</p> : null}

          <button type="submit" disabled={ loading || overLimit }>
            {loading ? 'Jobbar...' : 'Skapa stressdata'}
          </button>
        </form>

        <hr/>

        <button type="button" disabled={ loading } onClick={ this.removeStressGalleries.bind(this) }>
          Ta bort alla stressgallerier
        </button>

        { this.state.error ? <p className="stress-test-error">{this.state.error}</p> : null }
        { this.renderResult() }
      </div>
    );
  }
}

export default StressTestView;
