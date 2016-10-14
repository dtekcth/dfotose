import React from 'react';

function PreloadContainerFactory(initialStatePromise, Component) {
  class PreloadedContainer extends React.Component {
    state = {
      loaded: false
    };

    componentWillMount() {
      initialStatePromise(this.props)
        .then((initialState => {
          this.setState({
            ...initialState,
            loaded: true
          });
        }).bind(this));
    }

    render() {
      const isLoaded = this.state.loaded;
      return isLoaded ? <Component {...this.state} /> : <div>Loading...</div>;
    }
  }

  return PreloadedContainer;
}

export default PreloadContainerFactory;
