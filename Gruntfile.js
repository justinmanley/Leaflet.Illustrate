module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        changelog: {},

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },

        connect: {
            options: {
                base: ''
            },
            webserver: {
                options: {
                    port: 8888,
                    keepalive: true
                }
            },
            devserver: {
                options: {
                    port: 8888
                }
            },
            testserver: {
                options: {
                    port: 9999
                }
            },
            coverage: {
                options: {
                    base: 'coverage/',
                    directory: 'coverage/',
                    port: 5555,
                    keepalive: true
                }
            }
        },

        jshint: {
            options: {
                node: true,
                browser: true,
                esnext: true,
                bitwise: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                regexp: true,
                undef: true,
                unused: true,
                trailing: true,
                smarttabs: true,
                globals: {
                    L: false,

                    // Mocha

                    describe: false,
                    it: false,
                    before: false,
                    after: false,
                    beforeEach: false,
                    afterEach: false,
                    chai: false
                }
            },
            source: {
                src: [ 'src/*.js', 'src/*/*.js', 'Gruntfile.js', 'package.json' ]
            },
            test: {
                src: [ 'test/*Spec.js' ],
            },
            grunt: {
                src: ['Gruntfile.js']
            }
        },

        less: {
            source: {
                files: {
                    'dist/Leaflet.Illustrate.css': 'src/Leaflet.Illustrate.less'
                }
            }
        },

        mocha: {
            test: {
                options: { run: true },
                src: [ 'test/*.html' ]
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: true
            }
        },

        watch: {
            options : {
                livereload: 7777
            },
            source: {
                files: [
                    'src/extends-core/*.js',
                    'src/*.js',
                    'src/create/*.js',
                    'src/edit/*.js',
                    'src/Leaflet.Illustrate.less',
                    'test/*Spec.js',
                    'Gruntfile.js'
                ],
                tasks: [
                    'jshint',
                    'karma:unit:run',
                    'concat:dist',
                    'less'
                ]
            }
        },

        open: {
            devserver: {
                path: 'http://localhost:8888'
            }
        },

        concat: {
            dist: {
                options: {
                    banner: '(function(window, document, undefined) {\n\n"use strict";\n\n',
                    footer: '\n\n}(window, document));'
                },
                src: [
                    'src/L.Illustrate.js',
                    'src/extends-core/*.js',
                    'src/create/*.js',
                    'src/L.Illustrate.*.js',
                    'src/edit/*.js'
                ],
                dest: 'dist/Leaflet.Illustrate.js',
            }
        }
    });

    //single run tests
    grunt.registerTask('test', ['jshint:test', 'karma:unit:start', 'karma:unit:run']);

    //defaults
    grunt.registerTask('default', ['karma:unit:start', 'watch:source']);

    //development
    grunt.registerTask('dev', ['connect:devserver', 'open:devserver', 'watch:source']);

    //server daemon
    grunt.registerTask('serve', ['connect:webserver']);
};
