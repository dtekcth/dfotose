import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import App from './App';
import './css/all.scss';

const container = document.getElementById('root');
const ssrData = window.__DFOTO_SSR_DATA__;
const hasSsrMarkup = container.hasChildNodes();

// Hydrate SSR markup when Express rendered the current page. Otherwise keep the
// old SPA behavior for admin/login/search routes and development fallbacks.
const root = hasSsrMarkup
  ? hydrateRoot(container, <App ssrData={ssrData} />)
  : createRoot(container);

function renderApp(Component) {
  root.render(<Component ssrData={ssrData} />);
}

if (!hasSsrMarkup) {
  renderApp(App);
}

if (hasSsrMarkup) {
  setTimeout(() => {
    delete window.__DFOTO_SSR_DATA__;
  }, 0);
}

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;

    renderApp(NextApp);
  });
}
