const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const del = require('del');
const prefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const gulpStylelint = require('gulp-stylelint');
const gulpSprite = require('gulp-svg-sprite');
const uglifyJs = require('gulp-uglify');
const gulpClean = require('gulp-clean-css');
const svgmin = require('gulp-svgmin');
const fileInclude = require('gulp-include');
const gcmq = require('gulp-group-css-media-queries');
const pug = require('gulp-pug');
const pugLinter = require('gulp-pug-linter');
const plumber = require('gulp-plumber');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const formatHtml = require('gulp-format-html');
const imagemin = require('gulp-imagemin');
const imgCompress = require('imagemin-jpeg-recompress');

const path = {
  src: {
    pug: 'src/templates/*.pug',
    scss: 'src/scss/*.scss',
    js: 'src/js/*.js',
    img: 'src/img/**/*.+(png|jpg|jpeg|gif|svg|webp|ico|xml|webmanifest)',
    fonts: 'src/fonts/*.+(woff|woff2)',
    svg: 'src/svg/*.svg',
  },
  build: {
    pug: 'build',
    css: 'build/css',
    js: 'build/js',
    img: 'build/img',
    fonts: 'build/fonts',
  },
  watch: {
    all: 'build',
    pug: 'src/templates/**/*.pug',
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js',
    img: 'src/img/**/*.+(png|jpg|jpeg|gif|svg|webp|ico|xml|webmanifest)',
    fonts: 'src/fonts/*.+(woff|woff2)',
    svg: 'src/svg/*.svg',
  },
};

function lintCss() {
  return src(path.src.scss).pipe(
    gulpStylelint({
      reporters: [
        {
          failAfterError: true,
          formatter: 'string',
          console: true,
        },
      ],
    })
  );
}

function server() {
  browserSync.init({
    server: {
      baseDir: './build',
    },
    notify: false,
  });
  browserSync.watch(path.watch.all, browserSync.reload);
}

function clean() {
  return del(['build/**']);
}

function css() {
  return src(path.src.scss)
    .pipe(
      sass({
        outputStyle: 'expanded',
        indentWidth: 4,
      })
    )
    .pipe(
      prefixer({
        cascade: false,
        overrideBrowserslist: ['last 8 versions', '> 1%', 'not dead'],
        browsers: [
          'Android >= 4',
          'Chrome >= 20',
          'Firefox >= 24',
          'Explorer >= 11',
          'iOS >= 6',
          'Opera >= 12',
          'Safari >= 6',
        ],
      })
    )
    .pipe(gcmq())
    .pipe(
      gulpClean({
        level: 2,
      })
    )
    .pipe(dest(path.build.css))
    .pipe(
      sass({
        outputStyle: 'compressed',
      }).on('error', sass.logError)
    )
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(dest(path.build.css));
}

function html() {
  return src(path.src.pug)
    .pipe(plumber())
    .pipe(pugLinter({ reporter: 'default' }))
    .pipe(
      pug({
        pretty: '\t',
      })
    )
    .pipe(plumber.stop())
    .pipe(replace('&gt;', '>'))
    .pipe(
      formatHtml({
        indent_size: 4,
      })
    )
    .pipe(dest(path.build.pug));
}

function scripts() {
  return src(path.src.js)
    .pipe(fileInclude())
    .pipe(dest(path.build.js))
    .pipe(uglifyJs())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(dest(path.build.js));
}

function images() {
  return src(path.src.img).pipe(dest(path.build.img));
}

function optImages() {
  return src(path.src.img).pipe(
    imagemin([
      imgCompress({
        loops: 4,
        min: 70,
        max: 80,
        quality: 'high',
      }),
      imagemin.gifsicle(),
      imagemin.optipng(),
      imagemin.svgo(),
    ])
  );
}

function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts));
}

function svgSprite() {
  return src(path.src.svg)
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(replace('&gt;', '>'))
    .pipe(
      gulpSprite({
        mode: {
          symbol: {
            sprite: '../sprite.svg',
            render: {
              scss: {
                dest: '../../../src/scss/base/_sprite.scss',
                template: 'src/scss/base/_sprite_template.scss',
              },
            },
          },
        },
      })
    )
    .pipe(dest(path.build.img));
}

function watching() {
  watch(path.watch.pug, html);
  watch(path.watch.scss, css);
  watch(path.watch.js, scripts);
  watch(path.watch.img, images);
  watch(path.watch.svg, svgSprite);
  watch(path.watch.fonts, fonts);
}

exports.clean = clean;
exports.css = css;
exports.lintCss = lintCss;
exports.html = html;
exports.scripts = scripts;
exports.images = images;
exports.optImages = optImages;
exports.font = fonts;
exports.svgSprite = svgSprite;

exports.default = series(clean, parallel(html, css, scripts, images, fonts, svgSprite), parallel(watching, server));
exports.build = series(clean, parallel(html, css, scripts, optImages, fonts, svgSprite));
