/**
 * Created by asus on 06/09/16.
 */
var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

// Static server
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./docs"
    }
  });

  gulp.watch("docs/**/*.html").on('change', browserSync.reload);


});

gulp.task('default',['browser-sync']);