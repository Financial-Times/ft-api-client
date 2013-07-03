/*global module:true */
module.exports = function (grunt) {
    grunt.initConfig({
        jasmine_node: {
            specNameMatcher: "spec", // load only specs containing specNameMatcher
            projectRoot: ".",
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: false,
                savePath : "./build/reports/jasmine/",
                useDotNotation: true,
                consolidate: true
            }
        },

        /* WATCH */
        watch: {
            files: ["**/*.js"],
            tasks: ["default"]
        }
    });

    /* LOAD PLUGINS */
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jasmine-node');

    /* TARGETS */
    grunt.registerTask('default', ['jasmine_node']);
};
