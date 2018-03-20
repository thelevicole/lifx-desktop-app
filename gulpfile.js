// Gulp
const gulp = require('gulp');

// Sass/CSS
const sass		= require('gulp-sass');
const prefix	= require('gulp-autoprefixer');
const css_min	= require('gulp-minify-css');

// JavaScript
const js_min	= require('gulp-uglify-es').default;

// Images
const svg_min	= require('gulp-svgmin');
const image_min	= require('gulp-imagemin');

// Stats
const size		= require('gulp-size');
const gutil		= require('gulp-util');


// Compile sass
gulp.task('sass', function() {
	gulp.src(['./assets/sass/*.scss', '!./assets/sass/_variables.scss'])
		.pipe( sass({
			includePaths: ['./assets/sass'],
			outputStyle: 'expanded'
		}) )
		.pipe( prefix('last 1 version', '> 1%', 'ie 8', 'ie 7') )
		.pipe( gulp.dest('./css') )
		.pipe( css_min() )
		.pipe( gulp.dest('./css') );
});

// Uglify JS
gulp.task('uglify', function() {
	gulp.src('./assets/javascripts/*.js')
		.pipe( js_min() )
		.on('error', function(err) {
			gutil.log( gutil.colors.red('[Error]'), err.toString() );
		})
		.pipe( gulp.dest('./js') );
});

// Images
gulp.task('minify_svgs', function() {
	gulp.src('./assets/images/svg/*.svg')
		.pipe( svg_min() )
		.pipe( gulp.dest('./assets/images/svg') )
		.pipe( gulp.dest('./images/svg') );
});

gulp.task('minify_images', function() {
	gulp.src('./assets/images/**/*')
		.pipe( image_min() )
		.pipe( gulp.dest('./assets/images') )
		.pipe( gulp.dest('./images') );
});

// Stats
gulp.task('stats', function() {
	gulp.src('./**/*')
		.pipe( size() )
		.pipe( gulp.dest('./') );
});

//
gulp.task('default', ['sass', 'uglify', 'minify_svgs', 'minify_images']);
gulp.task('watch', function() {

	// Watch stylesheets
	gulp.watch('./assets/sass/**/*.scss', function() {
		gulp.run('sass');
	});

	// Watch JavaScripts
	gulp.watch('./assets/js/**/*.js', function() {
		gulp.run('uglify');
	});

	// Watch images
	gulp.watch('./assets/images/**/*', function() {
		gulp.run('minify_svgs');
		gulp.run('minify_images');
	});

});