import gulp from 'gulp';
import gulp_concat from 'gulp-concat';
import include from 'gulp-include';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin'; 
import browserSync from 'browser-sync';
import gulpif from 'gulp-if';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import babel from 'gulp-babel';

const sass = gulpSass(dartSass);

const server = browserSync.create();

// Функция для объединения JavaScript файлов
function scripts() {
    return gulp.src('src/scripts/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(include({ includePaths: './src/scripts/modules' }))
      .pipe(gulp_concat('main.js'))
      .pipe(babel({ presets: ['@babel/preset-env'] }))
      .pipe(terser())
      .pipe(rename({ extname: '.min.js' }))
      .pipe(sourcemaps.write('./js_map'))
      .pipe(gulp.dest('dist/scripts'))
      .pipe(server.stream());
}

// Функция для компиляции SCSS
function compileSass() {
    return gulp.src('src/styles/core.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead'], cascade: false }))
      .pipe(sourcemaps.write('./css_map'))
      .pipe(gulp.dest('dist/styles'))
      .pipe(server.stream());
}

//Функция для компиляции SCSS файлов для страниц index
function compileIndexSass() {
    return gulp.src('src/styles/index.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(rename('index.css'))
      .pipe(sourcemaps.write('./css_map'))
      .pipe(gulp.dest('dist/styles'))
      .pipe(server.stream());       
}

// Функция для компиляции SCSS файлов для страниц admin
function compileAdminPageSass() {
    return gulp.src('src/styles/pages/admin/admin.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename('admin-page.css'))
        .pipe(sourcemaps.write('./css_map'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(server.stream());                 
}

// Функция для компиляции SCSS файлов для страниц customer
function compileCustomerPageSass() {
    return gulp.src('src/styles/pages/customer/customers.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename('customer-page.css'))
        .pipe(sourcemaps.write('./css_map'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(server.stream());   
}

// Функция для перемещения изображений
function moveImages() {
    return gulp.src('src/assets/**/*', { encoding: false })
      .pipe(gulp.dest('dist/assets'));
}

// Обработка всех HTML файлов и их включение в `dist`
function pages() {
    return gulp.src('src/templates/**/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist/html_min'))
        .pipe(server.stream());
}

// Минификация HTML
function minifyHtml() {
    return gulp.src('src/templates/**/*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('dist/html_min'));
}

// Минификация JavaScript
function minifyJs() {
    return gulp.src('src/scripts/**/*.js')
      .pipe(terser())
      .pipe(rename({ extname: '.min.js' }))
      .pipe(gulp.dest('dist/scripts_min'))
      .pipe(server.stream());
}

// Запуск локального сервера
function serve(done) {
    server.init({
        server: { baseDir: './dist' },
        port: 4000
    });
    done();
}

// Наблюдение за изменениями в SCSS, HTML, JS и изображениях
function watchFiles() {
    gulp.watch('src/styles/**/*.scss', gulp.parallel(compileSass, compileIndexSass, compileAdminPageSass, compileCustomerPageSass));
    gulp.watch('src/templates/**/*.html', pages);
    gulp.watch('dist/html_min/**/*.html').on('change', server.reload);
    gulp.watch('src/scripts/**/*.js', scripts);
    gulp.watch('src/assets/**/*', moveImages);
}

// Экспортируем задачи
export {
    scripts,
    compileSass,
    moveImages,
    pages,
    minifyHtml,
    minifyJs,
    serve,
    watchFiles,
    compileIndexSass,
    compileAdminPageSass,
    compileCustomerPageSass
};

export const launch = gulp.series(
    gulp.parallel(pages, compileSass,compileIndexSass, compileAdminPageSass, compileCustomerPageSass, moveImages, scripts),
    gulp.parallel(minifyHtml, minifyJs)
)

// Задача по умолчанию, которая запускает все функции
export default gulp.series(
    gulp.parallel(pages, compileSass, compileIndexSass, compileAdminPageSass, compileCustomerPageSass, moveImages, scripts),
    gulp.parallel(minifyHtml, minifyJs), serve, watchFiles
);
