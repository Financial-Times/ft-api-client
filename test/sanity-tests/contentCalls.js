'use strict';

var FtApi = require('../../FtApi.js');

function handleResponse (error, item) {
  console.log(error);
  console.log(item);
}

function logDone () {
  console.log('Done!');
}

function logAllDone () {
  console.log('All Done!');
}

(function () {
  var ftApi,
    apiKey = 'f65958a8e35bd14bc52f268b8b3ab4ad',
    itemId = '84a0fcf0-d43e-11e2-8639-00144feab7de',
    pageId = 'c2efc338-d323-11e0-9ba8-00144feab49a',
    pageIds = [
      '3e9eafcc-55c7-11e2-9aa1-00144feab49a',
      'bd1f7f78-d3f0-11e2-8639-00144feab7de',
      '0c4e3756-f71c-11df-9b06-00144feab49a',
      'b501d88a-86be-11e0-9d41-00144feabdc0'
    ];

  ftApi = new FtApi(apiKey);
  ftApi.setLogLevel(FtApi.LOG_LEVEL_INFO);

  ftApi.getPages(pageIds, logDone, logAllDone);

  ftApi.getItem(itemId, logDone);
  ftApi.getPageList(logDone);

  setTimeout(function () {
    ftApi.getPage(pageId, handleResponse);
    ftApi.getPages(pageIds, logDone, logAllDone);
    ftApi.getPageContent(pageId, handleResponse);
  }, 10000);

  ftApi.getPage(pageId, logDone);
  ftApi.getPageContent(pageId, logDone);
})();
