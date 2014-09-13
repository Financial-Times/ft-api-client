# FT API Node Client

This is a node module that acts as a wrapper for the FT content api (<https://developer.ft.com>).

## Usage

    GLOBAL.Promise = require('es6-promise').Promise;

    var ft = require('../lib2/api')('your-api-key');

    ft
      .get('03b49444-16c9-11e3-bced-00144feabdc0')
      .then(function (article) {
        console.log(article.id);  //  print 
      }, function (err) {
        console.error(err);
      });
