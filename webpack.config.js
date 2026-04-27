const path = require('path');
const webpack = require('webpack');

module.exports = function createWebpackConfig(options = {}) {
  const production = Boolean(options.production);
  const target = options.target || 'web';
  const isServer = target === 'node';
  const cssLoader = {
    loader: 'css-loader',
    options: {
      url: {
        filter: (url) => !url.startsWith('/assets/')
      }
    }
  };

  return {
    devtool: production ? false : 'eval-cheap-module-source-map',
    mode: production ? 'production' : 'development',
    target,
    entry: isServer
      ? path.join(__dirname, 'src/server/ssr-renderer.js')
      : [
        ...(
          production
            ? []
            : [
              'webpack/hot/dev-server',
              'webpack-hot-middleware/client'
            ]
        ),
        path.join(__dirname, 'src/client/index.js')
      ],
    output: {
      path: isServer ? path.join(__dirname, 'dist/ssr') : path.join(__dirname, 'dist/public'),
      publicPath: '/',
      filename: isServer ? 'render.js' : 'bundle.js',
      chunkFilename: isServer ? '[name].js' : '[name].bundle.js',
      libraryTarget: isServer ? 'commonjs2' : undefined
    },
    plugins: production || isServer ? [] : [
      new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
      extensions: ['.js']
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              [
                '@babel/preset-env',
                {
                  loose: true,
                  modules: false
                }
              ],
              '@babel/preset-react'
            ],
            plugins: [
              [
                '@babel/plugin-proposal-decorators',
                {
                  legacy: true
                }
              ],
              [
                '@babel/plugin-transform-class-properties',
                {
                  loose: true
                }
              ],
              '@babel/plugin-transform-runtime'
            ]
          },
          exclude: [
            path.resolve(__dirname, 'node_modules')
          ],
          include: [
            path.resolve(__dirname, 'src')
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', cssLoader]
        },
        {
          test: /\.scss$/,
          use: ['style-loader', cssLoader, 'sass-loader']
        }
      ]
    },
    performance: {
      // The SSR bundle runs on the server, so browser asset budgets do not
      // apply. The client budget is set just above the current lazy-loaded
      // public entrypoint so future regressions still show up as warnings.
      hints: production && !isServer ? 'warning' : false,
      maxAssetSize: 450 * 1024,
      maxEntrypointSize: 450 * 1024
    }
  };
};
