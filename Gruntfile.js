module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bower: {
      install: {},
      options: {
        targetDir: 'appstorm/vendor'}
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          // Coming from Bower
          'appstorm/vendor/lodash/lodash.compat.js',
          'appstorm/vendor/handlebars/handlebars.js',
          'appstorm/vendor/watch/watch.js',
          'appstorm/vendor/mousetrap/mousetrap.min.js',

          'appstorm/a.js',

          'appstorm/core/mem.js',
          'appstorm/core/environment.js',
          'appstorm/core/console.js',
          'appstorm/core/debugger.js',
          'appstorm/core/message.js',
          'appstorm/core/parser.js',
          'appstorm/core/timer.js',
          'appstorm/core/hash.js',
          'appstorm/core/dom.js',
          'appstorm/core/ajax.js',
          'appstorm/core/loader.js',
          'appstorm/core/route.js',
          'appstorm/core/parameter.js',
          'appstorm/core/acl.js',
          'appstorm/core/mock.js',

          'appstorm/plugin/keyboard.js',
          'appstorm/plugin/callback.js',
          'appstorm/plugin/storage.js',
          'appstorm/plugin/translate.js',
          'appstorm/plugin/form.js',
          'appstorm/plugin/state.js',
          'appstorm/plugin/state.chain.js',
          'appstorm/plugin/state.type.js',
          'appstorm/plugin/state.protocol.js',
          'appstorm/plugin/binding.js',
          'appstorm/plugin/model.js',
          'appstorm/plugin/template.js',


          // Last loaded - ready event
          'appstorm/r.js'
        ],
        dest: 'appstorm/appstorm.concat.js',
        nonull: true,
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'appstorm/appstorm.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    qunit: {
      files: ['unittest/index-concat.html'],
      options: {
        force: true
      }
    },

    jshint: {
      files: [
        'Gruntfile.js',
        'appstorm/a.js',
        'unittest/resource/js/unittest/core/**/*.js',
        'unittest/resource/js/unittest/plugin/**/*.js',
        'example'
      ],
      options: {
        // options here to override JSHint defaults
        globals: {
          console: true,
          document: true,
        },
        force: true
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    },

    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'appstorm',
          //themedir: 'path/to/custom/theme/', // What theme?
          outdir: 'appstorm/doc',
          exclude: 'doc,vendor,<%= concat.dist.dest %>,appstorm/appstorm.min.js'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('doc', ['yuidoc']);



  // Since complete is not ready to be used yet, define simpler default
  grunt.registerTask('default', ['bower', 'concat', 'uglify']);

};

