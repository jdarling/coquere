Coquere
=======

Coquere is Latin for "to cook", and Coquere is meant to be a website for keeping
your recipes handy.  It is very much a work in progress.

Why?
====

There really are not any good open source recipe management systems on the web
today.  There are a few out there, but they are dated, ugly, hard to work with,
or I simply didn't like them.

I wanted to learn React, and needed a place to put my families recipes so we
could all get to them.  So figured I'd build something and learn something at
the same time.

Planned Features
================

  * Ingredient Substitutes - Provide alternative ingredients for existing
    recipes.  As an example in baked goods you can replace eggs with Corn Starch
    by replacing each large egg with 2 Tablespoons Corn Starch, 1 1/2 Tablespoons
    for medium eggs.
  * Recipe Search - Search by name and/or description.
  * Ingredient Search - Search for recipes by ingredient list.
  * User Accounts - Basic and integrated (Gmail, Facebook, etc...)
  * Share - Send to a friend, get a share URL for Facebook, G+, whatever, etc...
  * Ratings - Was a recipe good or bad, rate it and share you opinion.
  * Commenting - Add comments to recipes without providing a rating.
  * Suggest Alternatives - Suggest alternative versions of a recipe.
  * Scale - Recipe made for 6 but you only need 3?  Get the proper portions.
  * Import/Export
  * Print view
  * Fast editing - Allow paste of recipe text, try to parse it and create entry
    from the source.  Lots of work to do here.
  * ... ??? ... Open to ideas

Demo Version
============

A demo version of the latest stable (working) release is hosted at
http://coquere.jit.su/  Feel free to browse around and take a look at things.
Security is enabled on the server but all basic functionality (view, edit,
search) is enabled for anonymous users.  The only thing you can't do is save
changes or new recipes.

Requirements
============

Coquere is built in JavaScript from front to back and requires Node.js to run.

It uses an agnostic data store so as long as there is a driver for your database
of choice you can use it with your database of choice.  If there isn't a driver,
then write one and send a pull request.  Supported DB's today are MongoDB,
LevelDB, and Redis.  Would love to see adapters for other DB's.

Installation
============

Clone the repo:

```
git clone git@github.com:jdarling/coquere.git
or
git clone https://github.com/jdarling/coquere.git
```

Edit the config.json for your DB of choice.

Install the necessary drivers for your DB:

  * LevelDB - levelup, leveldown (or any levelup compatible driver)
  * Redis - redis
  * MongoDB - mongodb
  * Memory - Nothing to install, all data lost when server restarts.

Start the server:

```
node server.js
```

Want prettier logging, install bunyan and run with bunyan:

```
sudo npm install -g bunyan
node server.js | bunyan
```
