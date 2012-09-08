/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    staging: 'intermediate/',
    output: 'publish/',

    meta: {
      version: '0.1.0',
      banner: '/*! Enscroll - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://enscrollplugin.com/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Jason T. Stoudt; Licensed MIT */'
    },

    mkdirs: {
      staging: ''
    },

    lint: {
      files: [ 'grunt.js', 'js/script.js', 'js/mylibs/enscroll.js' ]
    },

    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          '<file_strip_banner:../js/mylibs/jquery.tools.min.js>',
          '<file_strip_banner:../js/mylibs/shi_default.min.js>',
          '<file_strip_banner:../js/mylibs/handlebars-1.0.0.beta.6.js>',
          '<file_strip_banner:../js/mylibs/enscroll.js>',
          '<file_strip_banner:../js/mylibs/respond.src.js>',
          '<file_strip_banner:../js/script.js>'
        ],
        dest: 'js/script.js'
      }
    },

    min: {
      dist: {
        src: [ '<banner:meta.banner>', '<config:concat.dist.dest>' ],
        dest: 'js/script.js'
      }
    },

    css: {
      'css/style.css': [ '../css/style.css' ]
    },

    rev: {
      js: [ 'js/*.js' ],
      css: [ 'css/*.css' ],
      img: [ 'images/*' ]
    },

    usemin: {
      html: [ '**/*.html' ],
      css: [ '**/*.css' ]
    },

    img: {
      src: [ 'images/*' ]
    },

    watch: {
      files: [ '*.html', 'js/**', 'css/**' ],
      tasks: 'default',

      reload: {
        files: '<config:watch.files>',
        tasks: 'default emit'
      }
    },

    server: {
      staging: {
        port: 8000,
        base: '<config:staging>'
      },
      output: {
        port: 8001,
        base: '<config:output>'
      }
    },

    connect: {
      intermediate: {
        hostname: 'localhost',
        port: 8000,
        logs: 'staging',
        dirs: true
      },

      publish: {
        hostname: 'localhost',
        port: 8001,
        logs: 'output',
        dirs: true
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    },

    uglify: {}

  });

  // Default task
  grunt.registerTask('default', 'intro clean lint mkdirs concat css min img rev usemin copy time');
  grunt.registerTask('reload', 'default connect watch:reload');
};
