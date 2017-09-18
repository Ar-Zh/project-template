'use strict'

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const path = require('path');
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

function lazyRequireTask(taskName, path, options) {
    options = options || {};
    options.taskName = taskName;
    gulp.task(taskName, function(callback) {
        let task = require(path).call(this, options);

        return task(callback);
    });
}

lazyRequireTask('clean', './tasks/clean', {
    src: 'public'
});

lazyRequireTask('templates', './tasks/templates', {
    src: 'frontend/templates/*.pug',
    dst: 'public'
});

lazyRequireTask('less', './tasks/less', {
    src: 'frontend/styles/*.less',
    dst: 'public/css'
});

lazyRequireTask('images', './tasks/images', {
    src: 'frontend/images/*.*',
    dst: 'public/img'
});

lazyRequireTask('fonts', './tasks/fonts', {
    src: 'frontend/fonts/*.*',
    dst: 'public/fonts'
});

gulp.task('watch', () => {
    global.watch = true;
    gulp.watch('frontend/**/*.pug', gulp.series('templates'))
        .on('all', (event, filepath, stats) => {
            global.emittyChangedFile = {
                path: filepath,
                stats
            };
        });
    gulp.watch('frontend/**/*.less', gulp.series('less'));
    gulp.watch('frontend/images/*.{svg,png,jpeg,jpg}', gulp.series('images'))
        .on('unlink', function(filepath) {
        remember.forget('images', path.resolve(filepath));
        delete cached.caches.images[path.resolve(filepath)];
    });
    gulp.watch('frontend/fonts/*.{woff,woff2}', gulp.series('fonts'))
        .on('unlink', function(filepath) {
        remember.forget('fonts', path.resolve(filepath));
        delete cached.caches.fonts[path.resolve(filepath)];
    });
});

gulp.task('serve', function() {
    browserSync.init({
        server: 'public'
    });
    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('build', gulp.series('clean', gulp.parallel('templates', 'less', 'images', 'fonts')));

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));