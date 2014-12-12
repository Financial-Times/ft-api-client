# FT API Node Client

This is a node module that acts as a wrapper for the FT content api (<https://developer.ft.com>).


## Setup

```shell
npm install https://github.com/Financial-Times/ft-api-client/archive/v{the version you need}.tar.gz
```

```javascript
var client = require('ft-api-client')(apiKey, config);
```

Where `config is an optional object accepting two properties

- `timeout` - maximum time (in ms) to wait for requests to complete
- `errorHandler` - function used to handle any errors resulting from any single api call (including the construction of models). The default handler logs to the console when `export DEBUG=ft-api-client:*;` is set.
- `elasticSearchKey` - The API key used when communicating with elastic search


### Articles

Then,

    client
      .get('03b49444-16c9-11e3-bced-00144feabdc0')
      .then(function (article) {
        console.log(article.id);
        console.log(article.largestImage);
      }, function (err) {
        console.error(err);
      });

Or you can get several resources in a single request,

    client
      .get([
          '03b49444-16c9-11e3-bced-00144feabdc0',
          '7d9ee96e-3a70-11e4-bd08-00144feabdc0',
          'a7008958-f2f3-11e3-a3f8-00144feabdc0'
        ])
      .then(function (articles) {
        console.log(articles);
      })

Alternatively use the new `mget` method in exactly the same way. To use `megt` you need to pass a `elasticSearchKey` property and value into the configuration

### Search 

Or retrieve a collection of articles via a search term,

    client
      .search("Climate change")
      .then(function (articles) {
        console.log(articles);
      })

To request more results than the default (`5`) pass in a second parameter with the number required.

### options

`.get()` and `.search()` also accepts an optional second parameter, `opts` with the following properties

 - `strict` - By default if a sub-promise of a request for multiple articles is rejected it will, after it is handled by `config.errorHandler`, be forced to resolve with `undefined`. This means e.g. `Promise.all(client.get(ids, {alwaysResolve: true}))` can reliably be used when the success of *every* call is not essential. If `strict: true`, then the prmoise will stay in its rejected state. 
 - `quantity` (only applies to search) - max number of results to return (default 5)
 - `resultContext` (only applies to search) - Overrides the [default `resultContext` config](https://github.com/Financial-Times/ft-api-client/blob/v3/lib/v1/search.js#L4) sent to the search api. Each property in this object will override the default. For properties which are arrays, prefixing the property name with '+' will concatenate with the default set e.g. `'+aspects': ['example']` will add `'example'` to the default list of aspects. 

### Pages

To retrieve the articles in a given page simply search for 'page:page name'. To retrieve metadata about the page use:
  client
      .pageInfo("page:page name")
      .then(function (metadata) {
        console.log(metadata);
      })


## Development

Install the dependencies,

    npm install

Check everything works,

    make test

Roll up your sleeves and dive in. New features will not be accepted without accompanying tests.