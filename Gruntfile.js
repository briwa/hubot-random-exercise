'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  grunt.initConfig({
    release: {
      options: {
        tagName: 'v<%= version %>',
        commitMessage: 'Bump version to <%= version %>'
      }
    },
    watch: {
      files: ['Gruntfile.js', 'test/**/*'],
      tasks: ['test']
    },
    mocha_istanbul: {
      coverage: {
          src: ['test/**/*'],
          options: {
              reporter: 'spec',
              require: ['coffee-script/register'], // needed because hubot (required for test) is written in coffeescript
              compilers: ['coffee:coffee-script']
          }
      },
    }
  });

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['mocha_istanbul:coverage']);
  grunt.registerTask('test:watch', ['watch']);
  grunt.registerTask('default', ['test']);
};
