module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        jshint: {
            options: { jshintrc: true },
            all: ['lib/**/*.js', 'migrations/*.js', '*.js']
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    quiet: false
                },
                src: ['test/**/*.js', 'test/**/*.coffee']
            }
        }

    });

    grunt.registerTask('default', ['jshint', 'mochaTest']);
};
