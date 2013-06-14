/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      prebuild: 'publish',
      postbuild: [
        'publish/libs/modernizr.js',
        'publish/js/script.js',
        'publish/js/modernizr.min.js',
        'publish/js/script.min.js',
        'publish/css/style.css'
      ]
    },
    handlebars: {
      compile: {
        files: {
          'js/documentation.js': ['templates/*.handlebars']
        }
      }
    },
    sass: {
      all: {
        options: {
          style: 'compact'
        },
        files: {
          'css/style.css': 'scss/style.scss'
        }
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      headscript: {
        src: [
          'js/libs/respond.src.js',
          'js/libs/modernizr-2.6.2.custom.js'
        ],
        dest: 'publish/js/libs/modernizr.js'
      },
      bodyscript: {
        src: [
          'js/libs/jquery-migrate-1.2.1.min.js',
          'js/mylibs/jquery.tools.min.js',
          'js/mylibs/shi_default.min.js',
          'js/mylibs/handlebars.runtime.js',
          'js/documentation.js',
          'js/mylibs/enscroll.js',
          'js/script.js'
        ],
        dest: 'publish/js/script.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      headscript: {
        src: '<%= concat.headscript.dest %>',
        dest: 'publish/js/modernizr.min.js'
      },
      bodyscript: {
        src: '<%= concat.bodyscript.dest %>',
        dest: 'publish/js/script.min.js'
      },
      release: {
        src: 'js/mylibs/enscroll.js',
        dest: 'releases/enscroll-<%= pkg.version %>.min.js'
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
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      all: ['Gruntfile.js', 'js/script.js', 'js/mylibs/enscroll.js']
    },
    imagemin: {
      all: {
        options: {
          optimizationLevel: 3
        },
        files: {
          'publish/images/black-scroll-vertical.png': 'images/black-scroll-vertical.png',
          'publish/images/broken_noise.jpg': 'images/broken_noise.jpg',
          'publish/images/green-vert-scrollbar.png': 'images/green-vert-scrollbar.png',
          'publish/images/logo.png': 'images/logo.png',
          'publish/images/white.png': 'images/white.png',
          'publish/images/green-horiz-scrollbar.png': 'images/green-horiz-scrollbar.png',
          'publish/images/wood_1.jpg': 'images/wood_1.jpg',
          'publish/images/xp-vert-handle.png': 'images/xp-vert-handle.png',
          'publish/images/black-scroll-horizontal.png': 'images/black-scroll-horizontal.png',
          'publish/images/headline-bg.png': 'images/headline-bg.png',
          'publish/images/logo_simple.png': 'images/logo_simple.png',
          'publish/images/cta-btn.png': 'images/cta-btn.png',
          'publish/images/offset-tab-bg.png': 'images/offset-tab-bg.png',
          'publish/images/subhead-mask.jpg': 'images/subhead-mask.jpg',
          'publish/images/close.png': 'images/close.png',
          'publish/images/config-head-bg.png': 'images/config-head-bg.png',
          'publish/images/tab-bg.png': 'images/tab-bg.png',
          'publish/images/btn-icons.png': 'images/btn-icons.png',
          'publish/images/feature-list-bullet.png': 'images/feature-list-bullet.png',
          'publish/images/xp-vert-btns.png': 'images/xp-vert-btns.png',
          'publish/images/folder-content-bg.png': 'images/folder-content-bg.png'
        }
      }
    },
    copy: {
      all: {
        files: [{
          src: [
            'images/*.gif',
            '*.html',
            '*.txt',
            'css/*.css',
            'releases/*',
            'favicon.ico',
            'js/libs/DD_belatedPNG_0.0.8a-min.js'
          ],
          dest: 'publish/',
          filter: 'isFile'
        }]
      }
    },
    rev: {
      css: {
        src: ['publish/css/style.css'],
        dest: 'publish/css'
      },
      script: {
        src: ['publish/js/script.min.js', 'publish/js/modernizr.min.js'],
        dest: 'publish/js'
      }
    },
    usemin: {
      html: ['publish/index.html'],
      options: {
        basedir: 'publish'
      }
    },
    watch: {
      options: {
        livereload: true
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      handlebars: {
        files: ['templates/*.handlebars'],
        tasks: ['handlebars']
      },
      sass: {
        files: ['scss/*.scss'],
        tasks: ['sass']
      },
      html: {
        files: ['*.html']
      }
    },
    connect: {
      enscroll: {
        options: {
          port: 8000,
          base: 'publish',
          keepalive: true,
          hostname: '*'
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks('grunt-usemin');

  // Default task.
  grunt.registerTask('default', [
    'clean:prebuild',
    'jshint',
    'handlebars',
    'sass',
    'copy:all',
    'concat',
    'uglify:headscript',
    'uglify:bodyscript',
    'imagemin',
    'rev',
    'usemin',
    'clean:postbuild'
  ]);

  grunt.registerTask('serve', ['default', 'connect:enscroll']);
  grunt.registerTask('release', ['uglify:release']);

};
