module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        jshint: {
            options: { jshintrc: true },
            all: ['lib/**/*.js', 'migrations/*.js', '*.js']
        }

    });

    grunt.registerTask('default', ['jshint']);
};
