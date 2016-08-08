////////////////////////////////////////
// GULP INIT
////////////////////////////////////////
var gulp = require('gulp');

var del = require('del');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var open = require('gulp-open');
var touch = require('gulp-touch');

var autoprefixerOptions = {
	browsers: ['last 2 versions', '> 5%']
};

////////////////////////////////////////
// DEFAULT GULP BUILD TASK, RUNS WHEN "MIDDLEMAN" COMMAND RUN IN TERMINAL
////////////////////////////////////////
gulp.task('default', function(callback) {
	runSequence('clean:cleanBuild', 'sass', 'scripts', ['watch'], callback);
});

////////////////////////////////////////
// "STATIC BUILD" GULP BUILD TASK, RUNS WHEN "MIDDLEMAN BUILD" COMMAND RUN IN TERMINAL
////////////////////////////////////////
gulp.task('buildProd', function(callback) {
	runSequence('clean:cleanBuild', 'sass', 'scripts', callback);
});

////////////////////////////////////////
// GULP TASKS BELOW
////////////////////////////////////////
gulp.task('clean:cleanBuild', function () {
	return del([
		'source/dist/**' // 'data/temp.json', 'source/javascripts/application.js'
	]);
});

gulp.task('scripts', function() {
	return gulp.src([
		'source/js/*.js'
	])
	.pipe(concat('all.js'))
	.pipe(gulp.dest('source/dist/js/'));
});

gulp.task('sass', function() {
	return gulp
	.src('source/sass/*.+(scss|sass)') // Gets all files ending with .sass or .scss in app/scss and children dirs
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError)) // Make sure to use sass.logError so watch task doesn't exit.
	.pipe(autoprefixer(autoprefixerOptions))
	// .pipe(cssmin()) // Not using cssmin, but easy to turn on
	// .pipe(rename({suffix: '.min'})) // Not renaming file to .min.css but easy to turn on
	.pipe(sourcemaps.write('maps/'))
	.pipe(gulp.dest('source/dist/css/'));
});

gulp.task('touchConfig', function() {
	gulp.src('config.rb').pipe(touch()); // Touch config.rb on gulpfile.js save so Middleman reloads everything.
});

////////////////////////////////////////
// BrowserSync lives inside the watch task. Much better this way because of css watch/browsersync reload concurrency issues. See below
////////////////////////////////////////
gulp.task('watch', ['sass'], function(gulpCallback) {
	// Changed browserSync and watch function based on http://paulsalaets.com/posts/injecting-styles-in-page-with-browser-sync
	// Now it's much better. No Sass/CSS watch task concurrency problems with BrowserSync/Gulp/Middleman.
	// Streamed .css and image files (aka live reloading) should now just work, no "double save" needed.
	browserSync.init({
		proxy: "localhost:4567",	// Proxy local running Middleman server.
		open: true, 				// Launch default browser on BrowserSync init.
		reloadDelay: 100,			// Seems to help, concurrency Voodoo. Probably.
		reloadDebounce: 500,		// Seems to help, concurrency Voodoo. Probably.
		reloadOnRestart: true,
		files: ["source/dist/css/*.css", "source/dist/js/*.js", "source/images/*.*"], // Use BrowserSync instead of gulp watchers to watch static files.
		port: 7000,			// The port the BrowserSync proxy runs on.
		ui: {
			port: 7001		// Port that BrowserSync UI tools runs on.
		},
	}, function callback() {
		// (server is now up)
		gulp.watch('config.rb', browserSync.exit); 			// Exit BrowserSync on config.rb change
		gulp.watch('source/sass/*.+(scss|sass)', ['sass']); // Watch Sass/Scss
		gulp.watch('source/js/*.js', ['scripts']);			// Watch js
		gulp.watch('gulpfile.js', ['touchConfig']);			// "Touch" config.rb on gulpfile.js save so Middleman reloads

		gulpCallback(); // notify gulp that this task is done
	});
});
