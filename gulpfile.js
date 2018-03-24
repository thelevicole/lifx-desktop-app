// Gulp
const gulp		= require('gulp');

// Sass/CSS
const sass		= require('gulp-sass');
const prefix	= require('gulp-autoprefixer');
const css_min	= require('gulp-clean-css');

// JavaScript
const concat	= require('gulp-concat');
const uglify	= require('gulp-uglify-es').default;
const babel		= require('gulp-babel');

// Images
const image_min	= require('gulp-imagemin');

// Stats
const size		= require('gulp-size');
const gutil		= require('gulp-util');

// Paths
const source	= './assets/';
const public	= './';

/**
 * Simply minify and combile javascript files
 * @param	{array|string}	scripts
 * @param	{[type]}		destination		Destination path e.g. `./dist/js/`
 * @param	{[type]}		file        	File name e.g. `main.js`
 * @return									Out put will be `./dist/js/main.js`
 */
function minify_js(scripts, destination, file, run_babel) {
	run_babel = typeof run_babel === 'boolean' ? run_babel : false;

	var src = gulp.src(scripts);
	if (run_babel) {
		src.pipe( babel() );
	}
	src.pipe( uglify() )
		.pipe( concat(file) )
		.on('error', function(err) {
			gutil.log( gutil.colors.red('[Error]'), err.toString() );
		})
		.pipe( gulp.dest(destination) );
}

// Compile sass
gulp.task('stylesheets', function() {
	return gulp.src([source+'sass/*.scss', '!'+source+'sass/_variables.scss'])
		.pipe( sass({
			includePaths: [source+'sass'],
			outputStyle: 'expanded'
		}) )
		.pipe( prefix('last 1 version', '> 1%', 'ie 8', 'ie 7') )
		.pipe( gulp.dest(public+'css') )
		.pipe( css_min() )
		.pipe( gulp.dest(public+'css') );
});

// Uglify JS
gulp.task('javascripts', function() {
	minify_js([
		source+'javascripts/vendor/Lifx.js',
		source+'javascripts/vendor/jQuery.LifxColorPicker.js'
	], public+'js', 'vendor.js', true);
	minify_js(source+'javascripts/app.js', public+'js', 'app.js', true);
});

// Minify images
gulp.task('images', function() {
	return gulp.src(source+'images/**/*')
		.pipe( image_min() )
		.pipe( gulp.dest(source+'images') )
		.pipe( gulp.dest(public+'images') );
});

// Build process
gulp.task('default', ['stylesheets', 'javascripts', 'images']);

gulp.task('watch', function() {
	gulp.watch([source+'**/*', '!'+source+'images/**/*'], ['stylesheets', 'javascripts']);
	gulp.watch([source+'images/**/*'], ['images']);
});



