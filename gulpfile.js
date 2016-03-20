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
	'source/dist/**'
	// 'data/temp.json', 'source/javascripts/application.js'
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
		.pipe(gulp.dest('source/dist/css/'))
		.pipe(browserSync.stream(
			{match: '**/css/*.css'}
		));
});

gulp.task('browserSync', function() {
  browserSync.init({
	port: 7000,
	//files: "source/dist/css/*.css",
	reloadDelay: 200,
		open: false,   // Don't open a browser window.
		ui: {
		port: 7001
	},
	ghostMode: {	  // Emitting clicks and forms from browserSync is bad when we've got our own emitter syncing user actions.
		clicks: true,
		forms: true,
		scroll: true
	}
  });
});

gulp.task('watch', ['browserSync', 'sass'], function(){
  gulp.watch('source/sass/*.+(scss|sass)', ['sass']);
  // Other watchers
  gulp.watch('**/*.erb', browserSync.reload);
  gulp.watch('source/dist/js/all.js', browserSync.reload);
  gulp.watch('source/js/*.js', ['scripts']);
  gulp.watch('config.rb', browserSync.exit);
});
