
GLOBAL.Promise = require('es6-promise').Promise;

var ft = require('../lib2/api')('xxx');

ft
  .get('03b49444-16c9-11e3-bced-00144feabdc0')
  .then(function (article) {
    console.log(article.body);
  });
