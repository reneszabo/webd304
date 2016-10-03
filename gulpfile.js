// VARIABLES
var gulp  = require('gulp');
var gutil = require('gulp-util');
var $     = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'browser-sync', 'del', 'lodash']
});
var _ = require('lodash');
var wiredep = require('wiredep').stream;
// The main paths of your project handle these with care

var paths = {
  src: 'docs',
  dist: 'docs/dest'
};

var errorHandler = function(title) {
  'use strict';
  return function(err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
};


// Static server
gulp.task('serve', ['bower','sass','scss-vendor', 'js'], function() {
  $.browserSync.init({
    server: {
      baseDir: "./"+ paths.src
    }
  });
  gulp.watch(paths.src+"/js/**/*.js", ['js-watch']);
  gulp.watch(paths.src+"/scss/**/*.scss", ['sass']);
  gulp.watch(paths.src+"/**/*.html").on('change', $.browserSync.reload);


});
// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['js'], function (done) {
  $.browserSync.reload();
  done();
});
// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  var sassOptions = {
    style: 'expanded'
  };
  return gulp.src([paths.src+"/scss/**/*.scss","!"+paths.src+"/scss/vendor.scss"] )
    .pipe($.sourcemaps.init())
    .pipe($.sass(sassOptions)).on('error', errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(paths.dist+"/css"))
    .pipe($.browserSync.stream());
});
// process JS files and return the stream.
gulp.task('js', function () {
  return gulp.src(paths.src+'/js/**/*.js')
    .pipe($.browserify())
    .pipe($.uglify())
    .pipe(gulp.dest(paths.dist+'/js'));
});


/* BOWER LIBS*/

gulp.task('bower-fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe(gulp.dest(paths.dist+'/fonts'));
});


gulp.task('bower-js', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.js'))
    .pipe(gulp.dest(paths.dist+'/js'));
});
gulp.task('bower', ['bower-fonts','bower-js']);


gulp.task('scss-vendor', function () {
  var sassOptions = {
    style: 'expanded'
  };
  var injectFiles = gulp.src([
    paths.src + '/scss/partials/**/*.scss',
    '!' + paths.src + '/scss/vendor.scss'
  ], {read: false});

  var injectOptions = {
    transform: function (filePath) {
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  var conf = {
    directory: 'bower_components'
  };
  return gulp.src(paths.src + '/scss/vendor.scss')
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(wiredep(_.extend({}, conf)))
    .pipe($.sourcemaps.init())
    .pipe($.sass(sassOptions)).on('error', errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    // .pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
    //  .pipe($.replace('../fonts/', '/fonts/'))
    .pipe(gulp.dest(paths.dist+"/css"));
});



gulp.task('clean', function () {
  return $.del([
    paths.dist+ '/css/*',
    paths.dist+ '/js/*',
    paths.dist+ '/fonts/*'
  ]);
});


gulp.task('default',['clean'],function(){
  gulp.start('serve');
});