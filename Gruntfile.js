/*global module:true */
module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		/* JSHINT */
		/* See http://is.gd/jshintopts for more options */
		/* This follows the npm style guide at http://is.gd/npmstyle */
		jshint: { /* Lint the Gruntfile, ftApi and all sub-modules */
			all: [
				'Gruntfile.js',
				'FtApi.js',
				'lib/**/*.js',
				'test/**/*.js'
			],
			options: {
				bitwise: true,
				devel: true, /* Permit console and alert while developing. */
				eqeqeq: true,
				forin: true,
				globals: { /* Jasmine's Globals*/
					'describe': false,
					'xdescribe': false,
					'it': false,
					'xit': false,
					'beforeEach': false,
					'afterEach': false,
					'jasmine': false,
					'spyOn': false,
					'waitsFor': false,
					'waits': false,
					'runs': false
				},
				immed: true,
				indent: 2,
				latedef: true,
				maxcomplexity: 10,
				maxdepth: 2,
				newcap: true,
				noarg: true,
				node: true, /* Expect node environment */
				noempty: true,
				onevar: true,
				predef: ['Promise'],
				plusplus: true,
				strict: true, /* Use one 'use strict'; per file. */
				trailing: true, /* Turn 'show whitespace' on in your editor. */
				undef: true,
				unused: true
			}
		},

		/* JASMINE ON NODE */
		/* See https://github.com/mhevery/jasmine-node for some info */
		'jasmine_node': {
			specNameMatcher: 'spec', // NB. Will match '.<specNameMatcher>.js'
			projectRoot: '.',
			requirejs: false,
			forceExit: true,
			jUnit: {
				report: false,
				savePath : './build/reports/jasmine/',
				useDotNotation: true,
				consolidate: true
			}
		},

		/* WATCH */
		watch: {
			files: ['**/*.js'],
			tasks: ['default']
		}
	});

	/* LOAD PLUGINS */
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jasmine-node');

	/* TARGETS */
	grunt.registerTask('default', ['jshint', 'jasmine_node']);
};
