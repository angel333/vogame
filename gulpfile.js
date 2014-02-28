var gulp = require('gulp'),
	download = require('gulp-download'),
	clean = require('gulp-clean'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');

var libraries = [
	'http://code.jquery.com/jquery-2.1.0.min.js',
	'https://raw.github.com/less/less.js/master/dist/less-1.6.3.min.js'
];


gulp.task('download-frontend-assets', function() {
	return download(libraries)
		.pipe(uglify({ preserveComments: 'some' }))
		.pipe(concat('vendor.min.js'))
		.pipe(gulp.dest('public/scripts'));
});


gulp.task('clean', function() {
	gulp.src('public/scripts/vendor.min.js', { read: false }).pipe(clean());
	gulp.src('node_modules', { read: false }).pipe(clean());
	gulp.src('npm-debug.log', { read: false }).pipe(clean());
});


gulp.task('install', [ 'download-frontend-assets' ]);
