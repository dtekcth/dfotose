import React from 'react';
import {StaticRouter} from 'react-router';
import {renderToString} from 'react-dom/server';

import App from '../client/App';

export function renderPage(location, ssrData) {
  return renderToString(
    <App
      Router={StaticRouter}
      routerProps={{location}}
      ssrData={ssrData}
    />
  );
}
