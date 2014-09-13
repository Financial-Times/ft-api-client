
GLOBAL.Promise = require('es6-promise').Promise;

var ft = require('../lib2/api')('ft-api-key');

var id = process.argv[2] || 'b3665d54-3b5e-11e4-885d-00144feabdc0';

console.log(id);

ft
  .get(id)
  .then(function (article) {
    console.log(article.id);
    console.log(article.largestImage);
  }, function (err) {
    console.log('error'); 
  });
