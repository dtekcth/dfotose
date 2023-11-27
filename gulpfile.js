var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var gulpSequence = require('gulp-sequence');
var concat = require('gulp-concat');
var util = require('gulp-util');
var filter = require('gulp-filter');
var env = require('gulp-env');

var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

var child = require('child_process');

var path = {
  SRV_SRC: ['packages/server/**/*', '!*~'],
  OUT_DIR: 'dist/',
};

var server = null;

gulp.task(
  'default',
  gulpSequence(
    ['server:build', 'config:copy', 'client:copy', 'server:spawn'],
    'watch'
  )
);

gulp.task('watch', function () {
  gulp.watch(path.SRV_SRC, ['server:rebuild']);
});

gulp.task('client:copy', function () {
  gulp.src('./src/client/index.html').pipe(gulp.dest(path.OUT_DIR + 'public'));

  gulp.src('./src/client/robots.txt').pipe(gulp.dest(path.OUT_DIR + 'public'));

  gulp.src('./src/client/favicon.ico').pipe(gulp.dest(path.OUT_DIR + 'public'));

  gulp
    .src('./src/client/assets/**/*')
    .pipe(gulp.dest(path.OUT_DIR + 'public/assets'));
});

gulp.task('config:copy', function () {
  gulp.src(path.CNF_SRC).pipe(gulp.dest(path.OUT_DIR + '/config'));
});

gulp.task('server:rebuild', function (next) {
  gulpSequence('server:build', 'server:spawn')(next);
});

gulp.task('client:build', function (callback) {
  webpackConfig.mode = 'production';
  webpack(webpackConfig, function (err, stats) {
    if (err) throw new util.PluginError('client:build', err);
    util.log('[client:build]', stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('server:build', function () {
  gulp
    .src(path.SRV_SRC)
    .pipe(
      babel({
        presets: ['es2015'],
      })
    )
    .pipe(gulp.dest(path.OUT_DIR));
});

gulp.task('server:env-release', function () {
  env({
    vars: {
      NODE_ENV: 'production',
    },
  });
});

gulp.task('server:release', ['server:env-release', 'server:build']);

gulp.task('server:spawn', function () {
  if (server) {
    server.kill();
  }

  server = child.spawn('node', ['dist/server.js']);
  server.on('close', function (code) {
    if (code === 8) {
      util.log('Error detected, waiting for changes ...');
    }
  });

  server.stdout.on('data', function (data) {
    util.log(util.colors.green(String(data).trim()));
  });

  server.stderr.on('data', function (data) {
    util.log(util.colors.red(String(data).trim()));
  });
});

process.on('exit', function () {
  if (server) {
    server.kill();
  }
});
