import _ from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';

const lazyLoadComponents = [];
let lazyLoadHandler = null;

function onLazyLoadCheck() {
  _.forEach(lazyLoadComponents, checkVisible);
}

function checkVisible(component) {
  const shouldBeVisible = isVisible(component);
  if (shouldBeVisible && !component.visible) {
    component.visible = true;
    component.forceUpdate();
  } else if (!shouldBeVisible) {
    component.visible = false;
  }
}

function isVisible(component) {
  const node = ReactDom.findDOMNode(component);
  if (!node) {
    console.error(`Could not find node ${component}`);
    return;
  }


  const rect = node.getBoundingClientRect();
  const {top} = rect;
  const windowInnerHeight = window.innerHeight || document.documentElement.clientHeight;
  const {offset, height} = component.props;

  return (top - offset <= windowInnerHeight) && (top + height >= 0);
}

export default class LazyLoad extends React.Component {
  static propTypes = {
    children: React.PropTypes.node,
    height: React.PropTypes.number.isRequired,
    offset: React.PropTypes.number.isRequired,
    placeHolder: React.PropTypes.node.isRequired
  };

  constructor() {
    super();

    this.visible = false;
  }

  shouldComponentUpdate() {
    return this.visible;
  }

  componentDidMount() {
    if (lazyLoadComponents.length == 0) {
      if (lazyLoadHandler == null) {
        lazyLoadHandler = _.throttle(onLazyLoadCheck, 150);
      }

      on(window, 'scroll', lazyLoadHandler);
    }

    lazyLoadComponents.push(this);

    const init = () => {
      checkVisible(this);
    };

    setTimeout(init.bind(this), 500);
  }

  componentWillUnmount() {
    const index = _.findIndex(lazyLoadComponents, this);
    lazyLoadComponents.splice(index);

    if (lazyLoadComponents.length == 0) {
      off(window, 'scroll', lazyLoadHandler);
    }
  }

  render() {
    const {placeHolder, children} = this.props;
    console.log('render ' + this.visible);
    return this.visible ? children : placeHolder;
  }
}

function on(el, eventName, callback) {
  if (el.addEventListener) {
    el.addEventListener(eventName, callback, false);
  } else if (el.attachEvent) {
    el.attachEvent(`on${eventName}`, (e) => {
      callback.call(el, e || window.event);
    });
  }
}

function off(el, eventName, callback) {
  if (el.removeEventListener) {
    el.removeEventListener(eventName, callback);
  } else if (el.detachEvent) {
    el.detachEvent(`on${eventName}`, callback);
  }
}
