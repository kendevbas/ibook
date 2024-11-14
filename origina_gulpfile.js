// Подключение модулей
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

// Инициализация gulp-sass с dart-sass
const sass = gulpSass(dartSass);

// Экземпляр browserSync
const server = browserSync.create();

// Функция для объединения JavaScript файлов
function scripts() {
    return gulp.src('src/js/**/*.js')
      .pipe(sourcemaps.init())                // Инициализация sourcemaps
      .pipe(include({ includePaths: './src/js/modules' })) // Включение модулей
      .pipe(gulp_concat('main.js'))           // Объединение файлов в main.js
      .pipe(babel({ presets: ['@babel/preset-env'] })) // Трансформация ES6+ в совместимый формат
      .pipe(terser())                         // Минификация JavaScript
      .pipe(rename({ extname: '.min.js' }))   // Переименование в *.min.js
      .pipe(sourcemaps.write('./js_map'))     // Запись sourcemaps
      .pipe(gulp.dest('dist/js'))             // Сохранение обработанных файлов
      .pipe(server.stream());                 // Обновление browserSync
}

// Функция для компиляции SCSS
function compileSass() {
    return gulp.src('./src/styles/core.scss')
      .pipe(sourcemaps.init())                // Инициализация sourcemaps для отладки
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError)) // Компиляция SCSS
      .pipe(autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead'], cascade: false })) // Автопрефиксы
      .pipe(sourcemaps.write('./css_map'))    // Запись sourcemaps
      .pipe(gulp.dest('./dist/styles'))       // Сохранение в dist/styles
      .pipe(server.stream());                 // Обновление browserSync
}

// Функция для перемещения изображений
function moveImages() {
    return gulp.src('./src/assets/**/*')
      .pipe(gulp.dest('./dist/assets'));
}

// Условная функция для определения файлов, кроме index.html
function isNotIndexHtml(file) {
    return file.relative !== 'index.html';
}

// Обработка HTML файлов с включением компонентов
function pages() {
    return gulp.src('./src/pages/*.html')
      .pipe(include({ includePaths: './src/html_components' })) // Включение компонентов
      .pipe(gulpif(isNotIndexHtml, gulp.dest('./dist/html_concat'))) // Сохранение всех файлов кроме index.html
      .pipe(gulpif(file => file.relative === 'index.html', gulp.dest('./dist'))) // Сохранение index.html в dist
      .pipe(server.stream());               // Обновление browserSync
}

// Минификация HTML
function minifyHtml() {
    return gulp.src('./src/pages/*.html')
      .pipe(htmlmin({ collapseWhitespace: true })) // Минификация HTML
      .pipe(gulp.dest('dist/html_min'));
}

// Минификация JavaScript
function minifyJs() {
    return gulp.src('./src/js/*.js')
      .pipe(terser())
      .pipe(rename({ extname: '.min.js' }))
      .pipe(gulp.dest('dist/script_min'))
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

// Наблюдение за изменениями файлов
function watchFiles() {
    gulp.watch('./src/styles/**/*.scss', compileSass);      // Наблюдение за SCSS
    gulp.watch(['src/html_components/*.html', 'src/pages/*.html'], pages); // Наблюдение за HTML
    gulp.watch('./src/js/**/*.js', scripts);                // Наблюдение за JS
    gulp.watch('./src/assets/**/*', moveImages);            // Наблюдение за изображениями
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
    watchFiles
};

export const launch = gulp.series(
    gulp.parallel(pages, compileSass, moveImages, scripts), // Первичная сборка
    gulp.parallel(minifyHtml, minifyJs),                    // Минификация
    watchFiles                                              // Наблюдение за файлами
)

// Задача по умолчанию, которая запускает все функции
export default gulp.series(
    gulp.parallel(pages, compileSass, moveImages, scripts), // Первичная сборка
    gulp.parallel(minifyHtml, minifyJs),                    // Минификация
    serve,                                                  // Запуск сервера
    watchFiles                                              // Наблюдение за файлами
);