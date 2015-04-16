# AppStorm.JS

AppStorm.JS is a powerful client-side Javascript framework to build fast, easy to read, and fully featured web applications.

## Project Structure

This repository uses the following structure:
  * **appstorm**: AppStorm.JS core
  * **unittest**: AppStorm.JS unit test

On the root, you will found:
  * **appstorm.concat.js**: A concat version of appstorm, mostly for debug purpose
  * **appstorm.min.js**: A all-in-one, production ready, version of appstorm.
  * **appstorm-without-dependencies.concat.js**: Same as concat above, without vendors (lodash, handlebars,...)
  * **appstorm-without-dependencies.min.js**: Same as min above, without vendors (lodash, handlebars,...)

By default, the **appstorm.min.js** is probably the one you are looking for.


## External Resources

  * [website](http://appstormjs.com)
  * [wiki](http://appstormjs.com/wiki)
  * [mail client example](http://appstormjs.com/git/example/mail)
  * [todolist client example](http://appstormjs.com/git/example/todo)


## How to Generate Minified File

This project uses [Grunt](http://gruntjs.com/) to automate download of
dependencies and generation of minified Javascript file.

You will need [Node, NPM and Grunt](http://gruntjs.com/getting-started) to
be installed, then simply invoking Grunt: ```grunt``` will download dependencies and generate minified file in appstorm/ directory.

## Licence & Credits

AppStorm.JS is licenced under MIT Licence.

You will find all the credits for everything used in AppStorm.JS [on our wiki](http://appstormjs.com/wiki/doku.php?id=credits).
