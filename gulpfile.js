const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass')(require('sass'));
const env = require('gulp-env');

const webpack = require('webpack');
const createWebpackConfig = require('./webpack.config.js');

const child = require('child_process');

// replacements for gulp-util
const log = require('fancy-log');
const PluginError = require('plugin-error');
const colors = require('ansi-colors');

const path = {
  SRV_SRC: ['src/server/**/*', '!*~'],
  CNF_SRC: ['src/config/**/*', '!*~'],
  OUT_DIR: 'dist/'
};

let server = null;

// -------------------- TASKS -------------------- //

gulp.task('client:copy', function () {
  return gulp.src([
    './src/client/index.html',
    './src/client/robots.txt',
    './src/client/favicon.ico',
    './src/client/assets/**/*'
  ], { base: './src/client', encoding: false })
    .pipe(gulp.dest(path.OUT_DIR + 'public'));
});

gulp.task('config:copy', function () {
  return gulp.src(path.CNF_SRC)
    .pipe(gulp.dest(path.OUT_DIR + '/config'));
});

gulp.task('server:build', function () {
  return gulp.src(path.SRV_SRC)
    .pipe(babel())
    .pipe(gulp.dest(path.OUT_DIR));
});

gulp.task('server:spawn', function (done) {
  if (server) {
    server.kill();
  }

  server = child.spawn('node', ['dist/server.js'], { stdio: ['pipe', 'pipe', 'pipe'] });

  server.on('close', function (code) {
    if (code === 8) {
      log('Error detected, waiting for changes ...');
    }
  });

  server.stdout.on('data', function (data) {
    log(colors.green(String(data).trim()));
  });

  server.stderr.on('data', function (data) {
    log(colors.red(String(data).trim()));
  });

  done();
});

gulp.task('server:env-release', function () {
  env({
    vars: {
      NODE_ENV: "production"
    }
  });
});

gulp.task('server:release', gulp.series('server:env-release', 'server:build'));

gulp.task('server:rebuild', gulp.series('server:build', 'server:spawn'));

gulp.task('client:build', function (callback) {
  const webpackConfig = createWebpackConfig({ production: true });
  webpack(webpackConfig, function (err, stats) {
    if (err) throw new PluginError("client:build", err);
    if (stats.hasErrors()) throw new PluginError("client:build", stats.toString({ colors: true }));
    log("[client:build]", stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('ssr:build', function (callback) {
  const webpackConfig = createWebpackConfig({ production: true, target: 'node' });
  webpack(webpackConfig, function (err, stats) {
    if (err) throw new PluginError("ssr:build", err);
    if (stats.hasErrors()) throw new PluginError("ssr:build", stats.toString({ colors: true }));
    log("[ssr:build]", stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('watch', function () {
  gulp.watch(path.SRV_SRC, gulp.series('server:rebuild'));
  gulp.watch(['src/client/**/*', 'src/server/ssr-renderer.js'], gulp.series('ssr:build', 'server:spawn'));
});

// -------------------- DEFAULT -------------------- //

gulp.task('default', gulp.series(
  gulp.parallel('server:build', 'ssr:build', 'config:copy', 'client:copy'),
  'server:spawn',
  'watch'
));

process.on('exit', function () {
  if (server) {
    server.kill();
  }
});
