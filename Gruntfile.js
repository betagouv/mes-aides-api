/* jshint indent: 2 */
'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: {
        options: {
          jshintrc: 'lib/.jshintrc'
        },
        src: ['lib/**/*.js', '*.js']
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['tests/**/*.js']
    }

  });

  grunt.registerTask('default', [
    'jshint',
    // 'mochaTest'
  ]);
};
