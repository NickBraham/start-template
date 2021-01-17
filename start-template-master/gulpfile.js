var gulp = require('gulp'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	ftp = require('vinyl-ftp'),
	notify = require("gulp-notify"),
	rsync = require('gulp-rsync');

	gulp.task('browser-sync', function() {
		browserSync({
			server: {
				baseDir: 'app'
			},
			notify: false,
		});
	});

gulp.task('common-js', function() {
	return gulp.src([
		'app/js/common.js',
		])
	.pipe(concat('common.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		'app/libs/jquery/jquery-1.11.1.min.js',
		'app/libs/wow/wow.js',
		'app/libs/parallax/parallax.min.js',
		'app/libs/page-scroll2id/jquery.malihu.PageScroll2id.js',
		'app/js/common.min.js', // Only last
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // 
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }));
});

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleanCSS())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream())
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/libs/**/*.js', browserSync.reload);
	gulp.watch('app/img/**/*.*', browserSync.reload);
	gulp.watch('app/css/*.css', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin())) // Cache Images
	.pipe(gulp.dest('dist/img')); 
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {

	var buildHtml = gulp.src('app/**/*.html')
		.pipe(gulp.dest('dist'));

	var buildCss = gulp.src(['app/css/*.css','!app/css/animate.css',])
		.pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src('app/js/scripts.min.js',)
		.pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src('app/fonts/**/*',)
		.pipe(gulp.dest('dist/fonts'));

	var buildHtaccess = gulp.src('app/.htaccess')
		.pipe(gulp.dest('dist'))

});

gulp.task('rsync', function() {
	return gulp.src('dist/**')
	.pipe(rsync({
		root: 'dist/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], 
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}));
});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clear', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);