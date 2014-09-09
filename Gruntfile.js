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
                    chai: false,
                    sinon: false
                }
            },
            source: {
                src: [ 'src/*.js', 'src/*/*.js', 'src/*/*/*.js', 'Gruntfile.js', 'package.json' ]
            },
            test: {
                src: [ 'test/*/*Spec.js', 'test/*/*/*Spec.js' ],
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
            travis: {
                configFile: 'test/karma.conf.js',
                background: false,
                singleRun: true,
                browsers: [ 'PhantomJS' ]
            },
            development: {
                configFile: 'test/karma.conf.js',
                background: true
            },
            unit: {
                configFile: 'test/karma.conf.js',
                background: false,
                singleRun: true
            }
        },

        watch: {
            options : {
                livereload: true
            },
            source: {
                files: [
                    'src/extends-leaflet/*.js',
                    'src/*.js',
                    'src/*/*.js',
                    'src/*/*/*.js',
                    'src/Leaflet.Illustrate.less',
                    'test/*.js',
                    'test/*/*Spec.js',
                    'test/*/*/*Spec.js',
                    'Gruntfile.js'
                ],
                tasks: [ 'build' ]
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
                    'src/extends-leaflet/*.js',
                    'src/core/L.Illustrate.Pointer.js',
                    'src/core/L.Illustrate.Pointer.SVG.js',
                    'src/core/L.Illustrate.Textbox.js',
                    'src/create/L.Illustrate.Create.js',
                    'src/create/L.Illustrate.Create.*.js',
                    'src/L.Illustrate.*.js',
                    'src/edit/*/*.js',
                    'src/edit/*.js'
                ],
                dest: 'dist/Leaflet.Illustrate.js',
            }
        }
    });

    /* Run tests for Travis CI. */
    grunt.registerTask('travis', [ 'jshint', 'karma:travis', 'coverage' ]);

    /* Run tests once. */
    grunt.registerTask('test', [ 'jshint', 'karma:test', 'coverage' ]);

    /* Default (development): Watch files and lint, test, and build on change. */
    grunt.registerTask('default', ['karma:development:start', 'watch']);

    grunt.registerTask('build', [
        'jshint',
        'karma:development:run',
        'coverage',
        'concat:dist',
        'less'
    ]);

    grunt.registerTask('coverage', 'Custom commmand-line reporter for karma-coverage', function() {
        var coverageReports = grunt.file.expand('coverage/*/coverage.txt'),
            reports = {},
            report, i, len;

        for (i = 0, len = coverageReports.length; i < len; i++) {
            report = grunt.file.read(coverageReports[i]);
            if (!reports[report]) {
                reports[report] = [coverageReports[i]];
            } else {
                reports[report].push(coverageReports[i]);
            }
        }

        for (report in reports) {
            if (reports.hasOwnProperty(report)) {
                for (i = 0, len = reports[report].length; i < len; i++) {
                    grunt.log.writeln(reports[report][i]);
                }
                grunt.log.writeln(report);
            }
        }
    });
};
