var gulp = require('gulp');
var named = require('vinyl-named');
var babel = require('gulp-babel');
var derequire = require('gulp-derequire');
var webpackStream = require('webpack-stream');

var build = function(config, opts) {
    var webpackOpts = require(config);

    if(opts.filename) {
        webpackOpts.output.filename = opts.filename;
    }

    webpackOpts.plugins.push(new webpackStream.webpack.optimize.OccurenceOrderPlugin());
    webpackOpts.plugins.push(new webpackStream.webpack.optimize.DedupePlugin());

    if (!opts.debug) {
        webpackOpts.plugins.push(
            new webpackStream.webpack.optimize.UglifyJsPlugin({
                compress: {
                    hoist_vars: true,
                    screw_ie8: true,
                    warnings: false
                }
            })
        );
    }
    return webpackStream(webpackOpts, null, function(err, stats) {
        if (err) {
            throw new gulpUtil.PluginError('webpack', err);
        }
        if (stats.compilation.errors.length) {
            gulpUtil.log('webpack', '\n' + stats.toString({colors: true}));
        }
    });
};

gulp.task('dev', function() {
    return gulp.src('src/scripts/main.js')
        .pipe(named())
        .pipe(babel())
        .pipe(build('./browser.config.js', {debug: true}))
        .pipe(derequire())
        .pipe(gulp.dest('public/scripts'));
});
