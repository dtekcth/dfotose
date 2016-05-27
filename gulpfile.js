var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var gulpSequence = require('gulp-sequence');
var concat = require('gulp-concat');
var util = require('gulp-util');
var filter = require('gulp-filter');

var child = require('child_process');
var browserSync = require('browser-sync').create();

var path = {
  SRV_SRC: ['src/server/**/*', '!*~'],
  CLI_SRC: ['src/client/**/*', '!*~'],

  OUT_DIR: 'dist/'
};

var server = null;

gulp.task('default', gulpSequence(['server:build', 'client:build'], 'server:spawn', 'watch'));

gulp.task('watch', function() {
  gulp.watch(path.SRV_SRC, ['server:rebuild']);
  gulp.watch(path.CLI_SRC, ['client:rebuild']);
});

gulp.task('client:build', function() {
  const jsf = filter('**/*.js', {restore: true});
  const sassf = filter('**/*.scss', {restore: true});

  gulp.src(path.CLI_SRC)

    .pipe(jsf)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(jsf.restore)

    .pipe(sassf)
    .pipe(sass().on('error', sass.logError))
    .pipe(sassf.restore)

    .pipe(gulp.dest(path.OUT_DIR + '/public'));
});

gulp.task('server:rebuild', function(next) {
  gulpSequence('server:build', 'server:spawn')(next);
});
gulp.task('client:rebuild', function(next) {
  gulpSequence('client:build', 'server:reload')(next);
});

gulp.task('server:build', function() {
  gulp.src(path.SRV_SRC)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(path.OUT_DIR));
});

gulp.task('server:spawn', function() {
  if (server) {
    server.kill();
  } else {
    browserSync.init({
      proxy: 'http://localhost:4000',
      port: 3000,
      open: false
    });
  }

  server = child.spawn('node', ['dist/server.js']);
  server.on('close', function(code) {
    if (code === 8) {
      util.log('Error detected, waiting for changes ...');
    }
  });

  server.stdout.on('data', function(data) {
      util.log(util.colors.green(String(data).trim()));
  });

  server.stderr.on('data', function(data) {
      util.log(util.colors.red(String(data).trim()));
  });

  setTimeout(function() {
    browserSync.reload();
  }, 500);
});

gulp.task('server:reload-bs', function() {
  if (server) {
    browserSync.reload();
  }
});

process.on('exit', function() {
  if (server) {
    server.kill();
  }
});
