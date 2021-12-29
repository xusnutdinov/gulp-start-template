// Глобальная установка всех необходимых пакетов
npm i --global gulp browser-sync gulp-sass gulp-rename del gulp-autoprefixer gulp-concat browser-sync gulp-imagemin gulp-stylelint gulp-svg-sprite gulp-uglify gulp-clean-css svgo gulp-svgmin gulp-include gulp-group-css-media-queries gulp-cheerio stylelint stylelint-config-recess-order stylelint-config-standard gulp-pug gulp-pug-linter gulp-plumber gulp-replace jquery bootstrap slick-carousel jquery-migrate owl.carousel postcss stylelint-config-sass-guidelines gulp-format-html gulp-util vinyl-ftp

// Подключение пактов к проекту
npm link gulp gulp-sass gulp-rename del gulp-autoprefixer gulp-concat browser-sync gulp-imagemin gulp-stylelint gulp-svg-sprite gulp-uglify gulp-clean-css svgo gulp-svgmin gulp-include gulp-group-css-media-queries gulp-cheerio stylelint stylelint-config-recess-order stylelint-config-standard gulp-pug gulp-pug-linter gulp-plumber gulp-replace jquery bootstrap slick-carousel jquery-migrate fslightbox sass owl.carousel postcss stylelint-config-sass-guidelines gulp-format-html gulp-util vinyl-ftp

// Запуск сборки для разработки
gulp default
// или
npm run dev

// Запуск сборки для продакшн
gulp build
// или
npm run prod