const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const config = require('./../webpack.config');

module.exports = function(app) {
  const myConfig = { ...config, output: { ...config.output, path: '/' } };
  const compiler = webpack(myConfig);

  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    stats: {
      colors: true,
      chunks: false
    }
  }));
  app.use(webpackHotMiddleware(compiler, {
    log: console.log
  }));
};

