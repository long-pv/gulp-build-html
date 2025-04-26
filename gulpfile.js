const { src, dest, series, parallel, watch } = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const del = require("del");
const browserSync = require("browser-sync").create();

const paths = {
	html: {
		src: ["src/html/**/*.html", "!src/html/partials/**"],
		watch: "src/html/**/*.html",
		dest: "dist/",
	},
	styles: {
		src: "src/scss/main.scss",
		watch: "src/scss/**/*.scss",
		dest: "dist/assets/css",
	},
	vendorStyles: {
		src: "src/scss/vendor.scss",
		watch: "src/scss/vendor.scss",
		dest: "dist/assets/css",
	},
	scripts: {
		src: "src/js/main.js",
		watch: "src/js/**/*.js",
		dest: "dist/assets/js",
	},
	vendorScripts: {
		src: ["node_modules/jquery/dist/jquery.min.js", "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", "node_modules/slick-carousel/slick/slick.min.js", "node_modules/jquery-match-height/dist/jquery.matchHeight-min.js", "node_modules/jquery-validation/dist/jquery.validate.min.js", "node_modules/wowjs/dist/wow.min.js", "node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js", "node_modules/select2/dist/js/select2.min.js"],
		dest: "dist/assets/js",
	},
	images: {
		src: "src/images/**/*",
		watch: "src/images/**/*",
		dest: "dist/assets/images",
	},
};

// Clean dist folder
function clean() {
	return del(["dist"]);
}

// HTML task
function html() {
	return src(paths.html.src)
		.pipe(fileInclude({ prefix: "@@", basepath: "@file" }))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(paths.html.dest))
		.pipe(browserSync.stream());
}

// Compile main.scss -> main.css
function styles() {
	return src(paths.styles.src).pipe(sass().on("error", sass.logError)).pipe(cleanCSS()).pipe(rename("main.css")).pipe(dest(paths.styles.dest)).pipe(browserSync.stream());
}

// Compile vendor.scss -> vendor.css
function vendorStyles() {
	return src(paths.vendorStyles.src)
		.pipe(sass({ url: false }).on("error", sass.logError))
		.pipe(cleanCSS())
		.pipe(rename("vendor.css"))
		.pipe(dest(paths.vendorStyles.dest))
		.pipe(browserSync.stream());
}

// Compile main.js -> main.js (minify)
function scripts() {
	return src(paths.scripts.src).pipe(uglify()).pipe(rename("main.js")).pipe(dest(paths.scripts.dest)).pipe(browserSync.stream());
}

// Bundle vendor JS -> vendor.js
function vendorScripts() {
	return src(paths.vendorScripts.src).pipe(concat("vendor.js")).pipe(dest(paths.vendorScripts.dest));
}

// Optimize images
function images() {
	return src(paths.images.src).pipe(imagemin()).pipe(dest(paths.images.dest)).pipe(browserSync.stream());
}

// Serve with BrowserSync + watch files
function serve() {
	browserSync.init({
		server: { baseDir: "dist" },
		port: 3000,
		notify: false,
	});

	watch(paths.html.watch, html);
	watch("src/html/partials/**/*.html", html);
	watch(paths.styles.watch, styles);
	watch(paths.vendorStyles.watch, vendorStyles);
	watch(paths.scripts.watch, scripts);
	watch(paths.images.watch, images);
}

// Tasks exports
exports.clean = clean;
exports.build = series(clean, parallel(html, styles, vendorStyles, scripts, vendorScripts, images));
exports.default = series(exports.build, serve);
