import React from 'react';

function hasMatchingServerState(props) {
  const initialPath = props.ssrInitialPath;
  const currentPath = props.location?.pathname;

  return props.ssrInitialState && initialPath && initialPath === currentPath;
}

function PreloadContainerFactory(initialStatePromise, Component, hydrateInitialState = state => state) {
  class PreloadedContainer extends React.Component {
    constructor(props) {
      super(props);

      // SSR data arrives as plain JSON. The optional hydrator converts it back
      // into the view-model objects expected by the wrapped component.
      this.state = hasMatchingServerState(props)
        ? {
          ...hydrateInitialState(props.ssrInitialState, props),
          loaded: true
        }
        : {
          loaded: false
        };
    }

    componentDidMount() {
      this.mounted = true;
      if (!this.state.loaded) {
        this.loadInitialState(this.props);
      }
    }

    componentDidUpdate(prevProps) {
      const oldPath = prevProps.location?.pathname;
      const newPath = this.props.location?.pathname;

      if (oldPath != newPath) {
        this.loadInitialState(this.props);
      }
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    loadInitialState(props) {
      this.setState({ loaded: false });

      initialStatePromise(props)
        .then((initialState => {
          if (this.mounted) {
            this.setState({
              ...initialState,
              loaded: true
            });
          }
        }).bind(this));
    }

    render() {
      const isLoaded = this.state.loaded;
      return isLoaded ? <Component {...this.props} {...this.state} /> : <div>Loading...</div>;
    }
  }

  return PreloadedContainer;
}

export default PreloadContainerFactory;
