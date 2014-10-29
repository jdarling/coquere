var browserify = require('browserify'),
    gulp = require('gulp'),
    source = require("vinyl-source-stream"),
    reactify = require('reactify');
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    fs = require('fs'),
    replace = require('gulp-replace'),
    inject = require('gulp-inject')
    ;

gulp.task('clean', function(cb) {
  del([
      'web/site/**'
    ], cb);
});

gulp.task('styles', function() {
  return gulp.src('web/src/style/main.less')
    .pipe(less())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename({basename: 'style'}))
    .pipe(gulp.dest('web/site/style'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('web/site/style'))
    ;
});

gulp.task('scripts', function(){
  var b = browserify();
  b.transform(reactify); // use the reactify transform
  b.add('./web/src/js/app.js');
  return b.bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('web/site/js'));
});

gulp.task('html', function(){
  return gulp.src('web/src/*.html')
  .pipe(inject(gulp.src(['web/src/partials/*.html']), {
    starttag: '<!-- inject:partials -->',
    transform: function (filePath, file) {
      // return file contents as string
      return file.contents.toString('utf8');
    }
  }))
  .pipe(replace(/<!--.+?-->/gm, ''))
  .pipe(gulp.dest('web/site'))
  ;
});

gulp.task('images', function() {
  return gulp.src('web/src/images/**/*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('web/site/images'))
    ;
});

gulp.task('watch', ['clean'], function() {
  // Watch .less files
  gulp.watch('web/src/style/**/*.less', ['styles']);
  // Watch .css files
  gulp.watch('web/src/style/**/*.css', ['styles']);
  // Watch .js files
  gulp.watch('web/src/js/**/*.js', ['scripts']);
  gulp.watch('web/src/lib/**/*.js', ['scripts']);
  gulp.watch('web/src/views/**/*.jsx', ['scripts']);
  // Watch image files
  gulp.watch('web/src/images/**/*', ['images']);
  // Watch the html files
  gulp.watch('web/src/**/*.html', ['html']);
  gulp.watch('web/src/**/*.md', ['html']);
  // Watch the vendor files
  gulp.start('styles', 'html', 'images', 'scripts');
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'html', 'images', 'scripts');
});
