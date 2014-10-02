
require('es6-promise').polyfill();

var ft = require('../lib/api')(process.env.apikey);

var id = process.argv[2] || 'b3665d54-3b5e-11e4-885d-00144feabdc0';

ft
  .get(id)
  .then(function (article) {
    console.log(article.id);
    console.log(article.largestImage.url);
  }, function (err) {
    console.log('error', err); 
  });

ft
  .search('authors:"Martin Wolf"', 7)
  .then(function (articles) {
      ft
        .get(articles.map(
            function (article) {
                return article.id
            }
        ))
        .then(function (a) {
            console.log(a.map(
                function (article) {
                    return article.id + ':' + article.raw.item.title.title;
                }
            ))
        })

  }, function (err) {
    console.log('error', err);
  });
