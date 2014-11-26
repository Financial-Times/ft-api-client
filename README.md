# FT API Node Client

This is a node module that acts as a wrapper for the FT content api (<https://developer.ft.com>).

## Usage

Install the dependencies,

    npm install

If you aren't using a Promise-friendly version of node,

    npm install --save es6-promise

Check everything works,

    make test

### Articles

Then,

    require('es6-promise').polyfill();

    var ft = require('../lib2/api')('your-api-key');

    ft
      .get('03b49444-16c9-11e3-bced-00144feabdc0')
      .then(function (article) {
        console.log(article.id);
        console.log(article.largestImage);
      }, function (err) {
        console.error(err);
      });

Or you can get several resources in a single request,

    ft
      .get([
          '03b49444-16c9-11e3-bced-00144feabdc0',
          '7d9ee96e-3a70-11e4-bd08-00144feabdc0',
          'a7008958-f2f3-11e3-a3f8-00144feabdc0'
        ])
      .then(function (articles) {
        console.log(articles);
      })

### Search 

Or retrieve a collection of articles via a search term,

    ft
      .search("Climate change")
      .then(function (articles) {
        console.log(articles);
      })

To request more results than the default (`5`) pass in a second parameter with the number required.

To override the [default `resultContext` config](https://github.com/Financial-Times/ft-api-client/blob/v3/lib/v1/search.js#L4) sent to the search api a third parameter can be passed, which should be an object conforming to the structure expected by `resultContext`. The properties in this object will override the defaults. For properties which are arrays prefixing the property name with '+' will concatenate the properties passed to the default set e.g. `'+aspects': ['example']` will add `'example'` to th edefault list of aspects. 
