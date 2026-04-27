import React from 'react';
import PropTypes from 'prop-types';

const lazyLoadComponents = [];
let lazyLoadHandler = null;

function onLazyLoadCheck() {
  lazyLoadComponents.forEach(checkVisible);
}

function throttle(callback, wait) {
  let timeout = null;
  let lastRun = 0;

  return function throttledCallback(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastRun);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      lastRun = now;
      callback(...args);
      return;
    }

    if (!timeout) {
      timeout = setTimeout(() => {
        lastRun = Date.now();
        timeout = null;
        callback(...args);
      }, remaining);
    }
  };
}

function checkVisible(component) {
  const node = component.nodeRef.current;
  const shouldBeVisible = isVisible(node, component.props);

  if (shouldBeVisible && !component.visible) {
    component.visible = true;
    component.forceUpdate();
  } else if (!shouldBeVisible) {
    component.visible = false;
  }
}

function isVisible(node, props = {}) {
  if (!node) {
    console.error('Could not find node');
    return false;
  }

  const rect = node.getBoundingClientRect();
  const { top } = rect;

  const windowInnerHeight =
      window.innerHeight || document.documentElement.clientHeight;

  const offset = props.offset ?? 0;
  const height = props.height ?? rect.height;

  return top - offset <= windowInnerHeight && top + height >= 0;
}

export default class LazyLoad extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    height: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    placeHolder: PropTypes.node.isRequired
  };

  constructor() {
    super();

    // SSR should emit real image tags, not placeholders. During hydration we
    // also start visible so React reconciles the server markup cleanly.
    this.visible = typeof window === 'undefined' || Boolean(window.__DFOTO_SSR_DATA__);
    this.nodeRef = React.createRef();
  }

  shouldComponentUpdate() {
    return this.visible;
  }

  componentDidMount() {
    if (lazyLoadComponents.length === 0) {
      if (lazyLoadHandler == null) {
        lazyLoadHandler = throttle(onLazyLoadCheck, 150);
      }

      on(window, 'scroll', lazyLoadHandler);
    }

    lazyLoadComponents.push(this);

    setTimeout(() => {
      checkVisible(this);
    }, 500);
  }

  componentWillUnmount() {
    const index = lazyLoadComponents.indexOf(this);
    if (index >= 0) {
      lazyLoadComponents.splice(index, 1);
    }

    if (lazyLoadComponents.length === 0) {
      off(window, 'scroll', lazyLoadHandler);
    }
  }

  render() {
    const { placeHolder, children } = this.props;

    return (
        <div ref={this.nodeRef}>
          {this.visible ? children : placeHolder}
        </div>
    );
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
