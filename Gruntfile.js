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
        src: ['lib/**/*.js', 'migrations/*.js', '*.js']
      }
    },

    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['tests/**/*.js']
    },

    env: {
      test: {
        NODE_ENV: 'test'
      }
    }

  });

  grunt.registerTask('default', [
    'jshint',
    'mochaTest'
  ]);
};
