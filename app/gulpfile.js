const { watch, series, parallel, src, dest } = require('gulp');
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");
const cleanCSS = require("gulp-clean-css");

const source = "./src";
const destination = "./public/static";

// Let everyone know gulp is busy
function message(done) {
  console.log("Gulp is running...");
  done();
}

// Move the fonts to the location the webserver expects
function copyFonts() {
  return src(source + "/fonts/**/*")
  .pipe(dest(destination + "/fonts"));
}

function copyImages() {
  return src(source + "/img/**/*")
    .pipe(dest(destination + "/img"));
};

// Optimize images
function compressImages() {
  return src(source + "/img/**/*")
  .pipe(imagemin())
  .pipe(dest(destination + "/img"));
};

// Move the javascript files to the location the webserver expects
function copyJs() {
  return src(source + "/js/**/*")
    .pipe(dest(destination + "/js"));
};
// Minify the javascript to decrease the filesize
function minifyJs() {
    return src(source + "/js/**/*.js")
    .pipe(uglify())
    .pipe(dest(destination + "/js"));
};

// Compile the sass to css and move the file to the location the webserver expects
function compileSass() {
  return src(source + "/sass/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(destination + "/css"));
};

function minifyCss() {
  return src(destination + "/css/**/*")
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(dest(destination + "/css/"));
};


exports.default = series(parallel(copyFonts, copyImages, copyJs, compileSass));
exports.build = series(parallel(copyFonts, compressImages, minifyJs, compileSass), minifyCss);

watch(source + "/**/*", exports.default);