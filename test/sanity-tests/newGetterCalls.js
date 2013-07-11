'use strict';

var FtApi = require('../../FtApi.js');

function handleResponse (error, item) {
  console.log(error);
  console.log(item);
}

(function () {
  var ftApi,
    apiKey = 'f65958a8e35bd14bc52f268b8b3ab4ad',
    itemId = '84a0fcf0-d43e-11e2-8639-00144feab7de',
    pageId = 'c2efc338-d323-11e0-9ba8-00144feab49a';

  ftApi = new FtApi(apiKey);

  ftApi.getItem(itemId, handleResponse);
  ftApi.getPageList(handleResponse);
  ftApi.getPage(pageId, handleResponse);
  ftApi.getPageContent(pageId, handleResponse);
})();
