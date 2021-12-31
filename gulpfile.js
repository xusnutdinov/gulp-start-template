const { src, dest, series, parallel, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const rename = require("gulp-rename");
const del = require("del");
const prefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync");
const gulpSprite = require("gulp-svg-sprite");
const uglifyJs = require("gulp-uglify");
const gulpClean = require("gulp-clean-css");
const svgmin = require("gulp-svgmin");
const fileInclude = require("gulp-include");
const gcmq = require("gulp-group-css-media-queries");
const gulpInclude = require("gulp-file-include");
const plumber = require("gulp-plumber");
const cheerio = require("gulp-cheerio");
const replace = require("gulp-replace");
const formatHtml = require("gulp-format-html");
const imagemin = require("gulp-imagemin");
const imgCompress = require("imagemin-jpeg-recompress");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");

const path = {
  src: {
    pug: "src/templates/*.html",
    scss: "src/scss/*.scss",
    js: "src/js/*.js",
    img: "src/img/**/*.+(png|jpg|jpeg|gif|svg|webp|ico|xml|webmanifest)",
    fonts: "src/fonts/*.+(woff|woff2)",
    svg: "src/svg/*.svg",
    misc: "src/misc/**/*",
  },
  build: {
    pug: "build",
    css: "build/css",
    js: "build/js",
    img: "build/img",
    fonts: "build/fonts",
    misc: "build",
  },
  watch: {
    all: "build",
    pug: "src/templates/**/*.html",
    scss: "src/scss/**/*.scss",
    js: "src/js/**/*.js",
    img: "src/img/**/*.+(png|jpg|jpeg|gif|svg|webp|ico|xml|webmanifest)",
    fonts: "src/fonts/*.+(woff|woff2)",
    svg: "src/svg/*.svg",
    misc: "src/misc/**/*",
  },
};

function server() {
  browserSync.init({
    server: {
      baseDir: "./build",
    },
    notify: false,
    ui: false,
    online: true,
  });
  browserSync.watch(path.watch.all, browserSync.reload);
}

function clean() {
  return del(["build/**"]);
}

function css() {
  return src(path.src.scss)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "expanded",
        indentWidth: 2,
      })
    )
    .pipe(
      prefixer({
        cascade: false,
        overrideBrowserslist: ["last 8 versions", "> 1%", "not dead"],
        browsers: [
          "Android >= 4",
          "Chrome >= 20",
          "Firefox >= 24",
          "Explorer >= 11",
          "iOS >= 6",
          "Opera >= 12",
          "Safari >= 6",
        ],
      })
    )
    .pipe(dest(path.build.css))
    .pipe(gcmq())
    .pipe(
      gulpClean({
        level: 2,
      })
    )
    .pipe(
      sass({
        outputStyle: "compressed",
      }).on("error", sass.logError)
    )
    .pipe(
      rename({
        extname: ".min.css",
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(dest(path.build.css));
}

function html() {
  return src(path.src.pug)
    .pipe(plumber())
    .pipe(gulpInclude())
    .pipe(plumber.stop())
    .pipe(replace("&gt;", ">"))
    .pipe(
      formatHtml({
        indent_size: 2,
      })
    )
    .pipe(dest(path.build.pug));
}

function scripts() {
  return src(path.src.js)
    .pipe(fileInclude())
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(dest(path.build.js))
    .pipe(uglifyJs())
    .pipe(
      rename({
        extname: ".min.js",
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
        quality: "high",
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
          $("[fill]").removeAttr("fill");
          $("[stroke]").removeAttr("stroke");
          $("[style]").removeAttr("style");
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(replace("&gt;", ">"))
    .pipe(
      gulpSprite({
        mode: {
          symbol: {
            sprite: "../sprite.svg",
            render: {
              scss: {
                dest: "../../../src/scss/base/_sprite.scss",
                template: "src/scss/base/_sprite_template.scss",
              },
            },
          },
        },
      })
    )
    .pipe(dest(path.build.img));
}

function misc() {
  return src(path.src.misc).pipe(dest(path.build.misc));
}

function watching() {
  watch(path.watch.pug, html).on("change", browserSync.reload);
  watch(path.watch.scss, css).on("change", browserSync.reload);
  watch(path.watch.js, scripts).on("change", browserSync.reload);
  watch(path.watch.img, images).on("change", browserSync.reload);
  watch(path.watch.svg, svgSprite).on("change", browserSync.reload);
  watch(path.watch.fonts, fonts).on("change", browserSync.reload);
  watch(path.watch.misc, misc).on("change", browserSync.reload);
}

exports.clean = clean;
exports.css = css;
exports.html = html;
exports.scripts = scripts;
exports.images = images;
exports.optImages = optImages;
exports.font = fonts;
exports.svgSprite = svgSprite;
exports.misc = misc;

exports.default = series(
  clean,
  parallel(html, css, scripts, misc, images, fonts, svgSprite),
  parallel(watching, server)
);

exports.build = series(
  clean,
  parallel(html, css, scripts, misc, optImages, fonts, svgSprite)
);
