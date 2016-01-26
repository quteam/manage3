var exec = require('child_process').exec,
    through2 = require('through2'),
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    uglify = require('gulp-uglify'),
    template = require('gulp-ng-template'),
    minifyHtml = require('gulp-minify-html'),
    preprocess = require('gulp-preprocess'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    cdn = require('gulp-cdn');

var Config = {
    name: "manageApp",
    itemName: "Manage System",
    version: "3.0",
    author: "haovei@qq.com",
    cdn: "http://ui.quteam.com/manage3"
};

gulp.task('clean', function () {
    exec('rm -rf build', function (err, out) {
        console.log(out);
        err && console.log(err);
    });
});

//template 没有 define
gulp.task('template', ['clean'], function () {
    return gulp.src('./src/demo/tpl/**/*.html')
        .pipe(minifyHtml({
            quotes: true,
            spare: true,
            empty: true
        }))
        .pipe(template({
            prefix: 'tpl/',
            moduleName: Config.name + ".template",
            standalone: true
        }))
        .pipe(header('define("' + Config.name + '.template",["angular"], function () {'))
        .pipe(footer('});'))
        .pipe(gulp.dest('./build/ui'));
});

gulp.task('js', ['template'], function () {
    gulp.src(['./src/ui/modules/**/*.js', './build/ui/templates.js', './src/ui/app.js'])
        .pipe(jshint())
        .pipe(concat('app.js'))
        .pipe(preprocess({context: {production: true}}))
        .pipe(uglify())
        .pipe(header('/**\n * ${itemName} v<%= version %> | <%= author %>\n */\n', Config))
        .pipe(gulp.dest('./build/ui'))
        .pipe(function () {
            //删除临时的模版文件
            return through2.obj(function (file, enc, cb) {
                exec('rm ./build/ui/templates.js', function (err, out) {
                    console.log(out);
                    err && console.log(err);
                });
                cb();
            });
        }());

    gulp.src(['./src/ui/libs/**/*.*'])
        //.pipe(uglify())
        .pipe(gulp.dest('./build/ui/libs'));
    gulp.src(['./src/ui/r.js']).pipe(gulp.dest('./build/ui'));
});

gulp.task('image', ['clean'], function () {
    gulp.src(['./src/ui/**/*.{png,jpg,gif,ico}'])
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            multipass: true
        }))
        .pipe(gulp.dest('./build/ui'));
});

gulp.task('css', ['clean'], function () {
    gulp.src(['./src/ui/less/*.less'])
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cssmin({
            advanced: false,
            compatibility: "*",
            keepBreaks: true
        }))
        .pipe(header('/**\n * ${itemName} v<%= version %> | <%= author %>\n */\n', Config))
        .pipe(gulp.dest('./build/ui/css'));
});

gulp.task('copy', ['clean'], function () {
    gulp.src(['./src/ui/img/**/*.*', '!./src/ui/img/**/*.{png,jpg,gif,ico}'])
        .pipe(gulp.dest('./build/ui/img'));
    //复制其他文件
    gulp.src(['./src/data/**/*.*']).pipe(gulp.dest('./build/data'));
    gulp.src(['./src/demo/**/*.*', '!./src/demo/tpl/**/*.*'])
        .pipe(cdn({
            domain: "../ui",
            cdn: Config.cdn
        }))
        .pipe(gulp.dest('./build/demo'));
});

gulp.task('clean-css', function () {
    return gulp.src("./src/ui/css")
        .pipe(clean());
});

gulp.task('build-less', function () {
    gulp.src(['./src/ui/less/*.less'])
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(gulp.dest('./src/ui/css'))
});

// 日常开发中使用
gulp.task('develop', function () {
    gulp.watch('./src/ui/less/*.less', ['build-less']);
});


gulp.task('default', ['clean', 'css', 'image', 'js', 'copy']);
