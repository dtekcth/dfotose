const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const env = require('gulp-env');

const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

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
  gulp.src('./src/client/index.html')
    .pipe(gulp.dest(path.OUT_DIR + 'public'));

  gulp.src('./src/client/robots.txt')
    .pipe(gulp.dest(path.OUT_DIR + 'public'));

  gulp.src('./src/client/favicon.ico')
    .pipe(gulp.dest(path.OUT_DIR + 'public'));

  return gulp.src('./src/client/assets/**/*')
    .pipe(gulp.dest(path.OUT_DIR + 'public/assets'));
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
  webpackConfig.mode = 'production';
  webpack(webpackConfig, function (err, stats) {
    if (err) throw new PluginError("client:build", err);
    log("[client:build]", stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('watch', function () {
  gulp.watch(path.SRV_SRC, gulp.series('server:rebuild'));
});

// -------------------- DEFAULT -------------------- //

gulp.task('default', gulp.series(
  gulp.parallel('server:build', 'config:copy', 'client:copy', 'server:spawn'),
  'watch'
));

process.on('exit', function () {
  if (server) {
    server.kill();
  }
});
