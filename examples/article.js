
GLOBAL.Promise = require('es6-promise').Promise;

var ft = require('../lib/api')(process.env.apikey);

var id = process.argv[2] || 'b3665d54-3b5e-11e4-885d-00144feabdc0';

console.log(id);

ft
  .get(id)
  .then(function (article) {
    console.log(article.id);
    console.log(article.largestImage);
    console.log(article.paragraphs(0, 2));
  }, function (err) {
    console.log('error'); 
  });


ft
  .search('topics:%22Climate%20change%22') // or authors:%22Martin%20Wolf%22
  .then(function (articles) {
    console.log(articles);
  }, function (err) {
    console.log('error', err); 
  });
