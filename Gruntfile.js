var fs = require('fs');

// Detect windows
var isWin = /^win/.test(process.platform);

var appstormFiles = [
  'appstorm/a.js',

  'appstorm/core/mem.js',
  'appstorm/core/environment.js',
  'appstorm/core/debugger.js',
  'appstorm/core/console.js',
  'appstorm/core/message.js',
  'appstorm/core/parser.js',
  'appstorm/core/timer.js',
  'appstorm/core/dom.js',
  'appstorm/core/hash.js',
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
  'appstorm/plugin/model.manager.js',
  'appstorm/plugin/model.pooler.js',
  'appstorm/plugin/model.template.js',
  'appstorm/plugin/template.js',


  // Last loaded - ready event
  'appstorm/r.js'
];

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// Simple walker, taken at
// http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
var walk = function(dir) {
    var results = [],
      list      = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(file));
        } else {
          results.push(file);
        }
    });
    return results;
};




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
      withDependencies: {
        src: [
          // Coming from Bower
          'appstorm/vendor/lodash/lodash.js',
          'appstorm/vendor/handlebars/handlebars.js',
          'appstorm/vendor/mousetrap/mousetrap.min.js',
          'appstorm/vendor/watch/watch.js',
        ].concat(appstormFiles),
        dest: './appstorm.concat.js',
        nonull: true,
      },
      withoutDependencies: {
        src: appstormFiles,
        dest: './appstorm-without-dependencies.concat.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          './appstorm.min.js': ['<%= concat.withDependencies.dest %>'],
          './appstorm-without-dependencies.min.js': ['<%= concat.withoutDependencies.dest %>']
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
      files: ['appstorm/core/ajax.js'],
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

    /*yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'appstorm',
          //themedir: 'path/to/custom/theme/', // What theme?
          outdir: 'appstorm/doc',
          exclude: 'doc,vendor,<%= concat.withDependencies.dest %>,<%= concat.withoutDependencies.dest %>,appstorm/appstorm.min.js'
        }
      }
    }*/

    mkdir: {
      doxx_html: {
        options: {
          create: ['docs', 'docs/core', 'docs/plugin']
        }
      },
      doxx_md: {
        options: {
          create: ['mds', 'mds/core', 'mds/plugin']
        }
      }
    },

    
    exec: {
      remove_doxx_html: {
        cmd: 'rm -rf ./docs'
      },
      install_doxx_html: {
        cmd: 'doxx --source appstorm --target docs --ignore vendor --target_extension html --template ./utils/doxx/html.jade'
      },
      rename_doxx_html: {
        cmd: function() {
          var results = walk('./docs');

          for (var i = 0, l = results.length; i < l; ++i) {
            var file = results[i];
            if (file.endsWith('.js.html')) {
              fs.renameSync(file, file.substr(0, file.length - 8) + '.html');
            }
          }

          if (isWin) {
            return 'dir > NUL';
          } else {
            return '/dev/null';
          }
        }
      },

      remove_doxx_md: {
        cmd: 'rm -rf ./mds'
      },
      install_doxx_md: {
        cmd: 'doxx --source appstorm --target mds --ignore vendor --target_extension md --template ./utils/doxx/md.jade'
      },
      rename_doxx_md: {
        cmd: function() {
          var results = walk('./mds');

          for (var i = 0, l = results.length; i < l; ++i) {
            var file = results[i];
            if (file.endsWith('.js.md')) {
              fs.renameSync(file, file.substr(0, file.length - 6) + '.md');
            }
          }

          // Also we don't need index at all...
          try { fs.unlinkSync('./mds/index.html');   } catch(e) {}

          // And also r.md
          try { fs.unlinkSync('./mds/r.md');   } catch(e) {}

          if (isWin) {
            return 'dir > NUL';
          } else {
            return '/dev/null';
          }
        }
      }
  }

  });

  // Code
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-task');

  // Documentation
  //grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-exec');

  /*
   * -----------------------
   *   TESTS
   * -----------------------
  */
  grunt.registerTask('hint', ['jshint']);
  grunt.registerTask('test', ['jshint', 'qunit']);

  /*
   * -----------------------
   *   DOCUMENTATION
   * -----------------------
  */
  //grunt.registerTask('doc', ['yuidoc']);
  grunt.registerTask('doc', ['exec:remove_doxx_html', 'mkdir:doxx_html', 'exec:install_doxx_html', 'exec:rename_doxx_html']);
  grunt.registerTask('doc_html', ['exec:remove_doxx_html', 'mkdir:doxx_html', 'exec:install_doxx_html', 'exec:rename_doxx_html']);

  grunt.registerTask('md', ['exec:remove_doxx_md', 'mkdir:doxx_md', 'exec:install_doxx_md', 'exec:rename_doxx_md']);
  grunt.registerTask('doc_md', ['exec:remove_doxx_md', 'mkdir:doxx_md', 'exec:install_doxx_md', 'exec:rename_doxx_md']);

  /*
   * -----------------------
   *   BUILD
   * -----------------------
  */
  // Different builds
  grunt.registerTask('with', ['bower', 'concat:withDependencies', 'uglify']);
  grunt.registerTask('without', ['bower', 'concat:withoutDependencies', 'uglify']);

  // Since complete is not ready to be used yet, define simpler default
  grunt.registerTask('default', ['bower', 'concat:withDependencies', 'uglify']);
};

