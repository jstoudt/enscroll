Compiling with SASS
===================

Since we are now using Sassy CSS to precompile our stylesheets, the style.css file that is normally present in this directory will no longer be included in the project.  Instead, you can install the sass ruby gem and precompile these stylesheets for yourself.

Head on over to http://sass-lang.com/ for a tutorial and instructions for installation on any platform.

	$ cs <root of the enscroll project>
    $ sass --watch scss:css

will monitor changes to the files in the scss/ directory and precompile them.

[@JasonStoudt](http://twitter.com/JasonStoudt) to hit me on Twitter for any questions.

Thanks!
