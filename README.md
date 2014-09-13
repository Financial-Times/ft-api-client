# FT API Node Client

This is a node module that acts as a wrapper for the FT content api (<https://developer.ft.com>).

## Usage

Install the dependencies,

    npm install

If you aren't using a Promise-friendly version of node,

    npm install --save es6-promise

Check everything works,

    make test

Then,

    GLOBAL.Promise = require('es6-promise').Promise;

    var ft = require('../lib2/api')('your-api-key');

    ft
      .get('03b49444-16c9-11e3-bced-00144feabdc0')
      .then(function (article) {
        console.log(article.id);
        console.log(article.largestImage);
      }, function (err) {
        console.error(err);
      });

