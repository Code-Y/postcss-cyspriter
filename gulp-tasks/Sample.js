function taskWatch(gulp, options) {
  'use strict';

  var
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cyspriter = require(options.cyspriterES5),

    cyspriterConfigs = {
      src: './examples/sprites',
      dest: './examples/generated'
    }

  ;

  console.log(cyspriter);

  return function() {
    return gulp
      .src(options.sample.src)
      .pipe(postcss([
        autoprefixer(),

        cyspriter(cyspriterConfigs)
      ]))
      .pipe(gulp.dest(options.sample.dest))
    ;
  };
}
module.exports = taskWatch;
