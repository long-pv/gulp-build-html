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
		src: "src/scss/style.scss",
		watch: "src/scss/**/*.scss",
		dest: "dist/assets/css",
	},
	scripts: {
		src: "src/js/main.js",
		watch: "src/js/**/*.js",
		dest: "dist/assets/js",
	},
	vendor: {
		css: ["node_modules/bootstrap/dist/css/bootstrap.min.css", "node_modules/slick-carousel/slick/slick.css", "node_modules/animate.css/animate.min.css", "node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css", "node_modules/select2/dist/css/select2.min.css"],
		js: ["node_modules/jquery/dist/jquery.min.js", "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", "node_modules/slick-carousel/slick/slick.min.js", "node_modules/jquery-match-height/dist/jquery.matchHeight-min.js", "node_modules/jquery-validation/dist/jquery.validate.min.js", "node_modules/wowjs/dist/wow.min.js", "node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js", "node_modules/select2/dist/js/select2.min.js"],
	},
	images: {
		src: "src/images/**/*",
		watch: "src/images/**/*",
		dest: "dist/assets/images",
	},
};

// Clean dist
function clean() {
	return del(["dist"]);
}

// HTML build with include
function html() {
	return src(paths.html.src)
		.pipe(fileInclude({ prefix: "@@", basepath: "@file" })) // Chèn các partials vào
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(paths.html.dest))
		.pipe(browserSync.stream());
}

// SCSS build -> style.css (bỏ timestamp)
function styles() {
	return src(paths.styles.src)
		.pipe(sass().on("error", sass.logError))
		.pipe(cleanCSS())
		.pipe(rename("style.css")) // Tên file là 'style.css'
		.pipe(dest(paths.styles.dest))
		.pipe(browserSync.stream());
}

// Vendor CSS -> vendor.css
function vendorStyles() {
	return src(paths.vendor.css)
		.pipe(cleanCSS())
		.pipe(concat("vendor.css")) // Tên file là 'vendor.css'
		.pipe(dest(paths.styles.dest)); // Output vào dist/assets/css
}

// JS build -> main.js (bỏ timestamp)
function scripts() {
	return src(paths.scripts.src)
		.pipe(uglify())
		.pipe(rename("main.js")) // Tên file là 'main.js'
		.pipe(dest(paths.scripts.dest))
		.pipe(browserSync.stream());
}

// Vendor JS -> vendor.js
function vendorScripts() {
	return src(paths.vendor.js)
		.pipe(concat("vendor.js")) // Tên file là 'vendor.js'
		.pipe(dest(paths.scripts.dest)); // Output vào dist/assets/js
}

// Image processing
function images() {
	return src(paths.images.src).pipe(imagemin()).pipe(dest(paths.images.dest));
}

// Dev server
function serve() {
	browserSync.init({
		server: { baseDir: "dist" },
		port: 3000,
		notify: false,
	});

	watch(paths.html.watch, html);
	watch("src/html/partials/**/*.html", html);
	watch(paths.styles.watch, styles);
	watch(paths.scripts.watch, scripts);
	watch(paths.images.watch, images);
}

// Tasks
exports.clean = clean;
exports.build = series(clean, parallel(html, styles, scripts, vendorScripts, vendorStyles, images));
exports.default = series(exports.build, serve);
