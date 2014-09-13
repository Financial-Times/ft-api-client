
GLOBAL.Promise = require('es6-promise').Promise;

var ft = require('../lib2/api')('f65958a8e35bd14bc52f268b8b3ab4ad');

ft
  .get('03b49444-16c9-11e3-bced-00144feabdc0')
  .then(function (article) {
    console.log(article.body);
  })
  .catch(function (err) {
    console.log('error'); 
  });
