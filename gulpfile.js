"use strict";

// Sample file ``from https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a

// Load plugins
const gulp = require("gulp");
const fs = require('fs-extra'); 
const del = require('del');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const browsersync = require('browser-sync').create();
const open = require('gulp-open');
const touch = require('gulp-touch');
const svgsprite = require('gulp-svg-sprite');
const plumber = require('gulp-plumber');

const autoprefixerOptions = {
	browsers: ['last 2 versions', '> 5%']
};

function touchConfig(done)  {
	gulp.src('config.rb').pipe(touch()); 		// <-- Touch config.rb on gulpfile.js save so Middleman restarts.
	done();
}

// BrowserSync
function browserSync(done) {
  browsersync.init({
	notify: true,					// <-- Don't show the top right notification on BrowserSync changes.
	// ghostMode: false,				// <-- Turn off syncing of scroll and clicks across browser windows.
	proxy: "localhost:4567",		// <-- Proxy local running Middleman server.
		open: true, 				// <-- Launch default browser on BrowserSync init.
		reloadOnRestart: true,
    port: 7000,      // <-- The port the BrowserSync proxy runs on.
    ui: {
			port: 7001		// <-- Port that BrowserSync UI tools runs on.
		}
  });
  done();
}

// BrowserSync Reload, used for slim and erb file changes
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del([
		'source/dist/**'
	]);
}

function copyFonts(done)  {
	return gulp.src('source/fonts/**/*.{ttf,woff,woff2,eof}')
	.pipe(gulp.dest('./source/dist/fonts/'))
	.pipe(browsersync.stream());
	done();
}

function copyImages(done)  {
	return gulp.src(['source/images/**/*.{png,jpg,jpeg,gif,svg}', '!source/**/svg-sprite/**/*'])
	.pipe(gulp.dest('./source/dist/images/'))
	.pipe(browsersync.stream());
}

// SVG sprites
function svgSprite(done)  {
	fs.outputFile('source/dist/css/_svg-sprite.scss', '')
	.catch(err => {
		console.error(err)
	});
	var baseDir	  = 'source/images/svg-sprite',							// <-- Set to your SVG base directory
	svgGlob	  = '**/*.svg',	   											// <-- Glob to match your SVG files
	outDir	   = './source/dist/images/svg-sprite',						// <-- Main output directory
	config	   = {
		dest: '.',
		mode: {
			view: {														// <-- Use "view" mode for "css" svg sprites that can be used as inline images also.
				dest: '../',
				sprite: '../images/svg-sprite/global-sprite.svg',		// <-- Paths are tricky http://stackoverflow.com/questions/29838150/modifying-destination-and-filename-of-gulp-svg-sprite
				bust: false,											// <-- Turn off Cache busting
				layout: 'packed',										// <-- Pack the svg shapes tightly spaced in the sprite
				example: true,											// <-- Render out a sample .html file to /source/dist/images/sprite.view.html showing the sprites
				render: {
					scss: {
						dest: '../css/_svg-sprite.scss'					// <-- Output the scss file that will be imported into the main sass
					}
				}
			},
			symbol: {
				layout: 'packed', // <-- Use "symbol" mode for svg sprites that can be used as inline images also.
				example: true
			}
		}
	};
	return gulp.src(svgGlob, {cwd: baseDir})
		.pipe(plumber())
		.pipe(svgsprite(config)).on('error', function(error){ console.log(error); })	// <-- Plumber error handler
		.pipe(gulp.dest(outDir))														// <-- Output the files
		.pipe(browsersync.stream());
		done();
}


function styles(done)  {
	return gulp.src('source/sass/**/*.+(scss|sass)')		// <-- Gets all files ending with .sass or .scss in app/scss and children dirs
	.pipe(plumber())
	.pipe(sourcemaps.init())					// <-- Enables sourcemap for later output
	.pipe(sass()).on('error', sass.logError)	// <-- Make sure to use sass.logError so gulp.js 'watch' task doesn't die when there's a Sass build error.
	.pipe(autoprefixer(autoprefixerOptions))	// <-- Autoprefix the resultant .css
	// .pipe(cssmin()) 							// <-- Minify .css
	.pipe(rename({suffix: '.min'})) 			// <-- Rename minified file to .min.css
	.pipe(sourcemaps.write('maps/'))			// <-- Turn on .css source map
	.pipe(gulp.dest('source/dist/css/'))		// <-- Output the completed .css file
	.pipe(browsersync.stream());
	done();
}


function scripts()  {		// <-- This blog concatenates .js files and put them in 'dist'
	return gulp.src([
		'source/js/*.js'
	])
	.pipe(concat('all.js'))
	.pipe(gulp.dest('source/dist/js/'))
	.pipe(browsersync.stream());
}


// Watch files
function watchFiles(done) {
  gulp.watch('config.rb', browserSync.exit);  // <-- Exit BrowserSync on config.rb change
  gulp.watch('gulpfile.js', touchConfig); // <-- "Touch" config.rb on gulpfile.js save so Middleman reloads
  gulp.watch("source/**/*.+(scss|sass)", styles);
  gulp.watch("source/js/*.js", scripts);
  gulp.watch('source/images/svg-sprite/*.svg', gulp.series(clean, scripts, copyFonts, copyImages, svgSprite, styles, browserSyncReload));    // Couldn't quite get SVG spriting to work on svg files changes without doing a full clean and rebuild
  gulp.watch(['source/images/**/*.{png,jpg,jpeg,gif,svg}', '!source/**/svg-sprite/**/*'], copyImages);
  gulp.watch('source/fonts/**/*.+(ttf|woff|woff2|eof)', copyFonts);
  gulp.watch(
    [
	  "source/**/*.erb", 
      "source/**/*.slim",
      "source/**/*.html",
	  "!static-build-output/**/*.*"
    ],
    gulp.series(browserSyncReload)
  );
  done();
}

// Tasks

gulp.task("clean", clean);
gulp.task("touchConfig", touchConfig);
gulp.task("copyFonts", copyFonts);
gulp.task("copyImages", copyImages);
gulp.task("styles", styles);
gulp.task("scripts", scripts);
gulp.task("svgSprite", svgSprite);


// // watch
// gulp.task("watch", gulp.parallel(watchFiles, browserSync));

////////////////////////////////////////
// DEFAULT GULP BUILD TASK, RUNS WHEN "MIDDLEMAN" COMMAND RUNS IN TERMINAL
////////////////////////////////////////
gulp.task(
  "default",
  gulp.series(clean, scripts, copyFonts, copyImages, svgSprite, styles, browserSync, watchFiles)
);


////////////////////////////////////////
// "STATIC BUILD" GULP BUILD TASK, RUNS WHEN "MIDDLEMAN BUILD" COMMAND RUNS IN TERMINAL
////////////////////////////////////////
gulp.task(
  "buildProd",
  gulp.series(clean, scripts, copyFonts, copyImages, svgSprite, styles)
);