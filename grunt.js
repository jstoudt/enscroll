/*global module:false,grunt:false*/

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // the staging directory used during the process
    staging: 'intermediate/',

    // final build output
    output: 'publish/',

    meta: {
      version: '0.2.9',
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
          '<file_strip_banner:../js/script.js>'
        ],
        dest: 'js/script.js'
      },
      modernizr: {
        src: [
          '../js/libs/respond.src.js',
          '../js/libs/modernizr-2.6.2.custom.js'
        ],
        dest: 'js/libs/modernizr.js'
      },
      jquery: {
        src: [
          '../js/libs/jquery-1.9.1.js',
          '../js/libs/jquery-migrate-1.1.1.js'
        ],
        dest: 'js/libs/jquery-1.9.1.min.js'
      },
      dd_belated: {
        src: '../js/libs/DD_belatedPNG_0.0.8a-min.js',
        dest: 'js/libs/DD_belatedPNG_0.0.8a-min.js'
      }
    },

    min: {
      script: {
        src: [ '<banner:meta.banner>', '<config:concat.dist.dest>' ],
        dest: 'js/script.js'
      },
      jquery: {
        src: '<config:concat.jquery.dest>',
        dest: 'js/libs/jquery-1.9.1.min.js'
      },
      modernizr: {
        src: '<config:concat.modernizr.dest>',
        dest: 'js/libs/modernizr.min.js'
      }
    },

    css: {
      'css/style.css': [ '../css/style.css' ]
    },

    rev: {
      js: [ 'js/script.js', 'js/libs/modernizr.min.js' ],
      css: [ 'css/*.css' ]
    },

    usemin: {
      html: [ '**/*.html' ],
      css: [ '**/*.css' ],
      js: [ 'js/**/*.js' ]
    },

    img: {
      src: [ 'images/**/*.png', 'images/**/*.jpg' ]
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
  grunt.registerTask('publish', 'default server');
};
