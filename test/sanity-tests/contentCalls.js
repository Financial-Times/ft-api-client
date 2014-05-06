'use strict';

var FtApi = require('../../FtApi.js');

function handleDone (error, item) {
  console.log('Error:', error);
  console.log('Item:', (item ? 'exists' : item));
  console.log(''); // Line separator
}

function handleAllDone (errors, items) {
  console.log('All Done!');
  console.log('Errors:', errors);
  console.log('Item count:', (items && items.length > 0 ? items.length : 0));
  console.log(''); // Line separator
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

  ftApi = new FtApi({apiKey: apiKey, logLevel: FtApi.LOG_LEVEL_INFO});

  // Hit the client with lots of requests to max out the concurrent requests
  // ftApi.getPages(pageIds, null, handleAllDone);
  // ftApi.getPages(pageIds, handleDone, handleAllDone);
  ftApi.getItem(itemId, handleDone);
  ftApi.getItem(itemId, handleDone);
  ftApi.getItem(itemId, handleDone);
  ftApi.getItem(itemId, handleDone);
  ftApi.getItem(itemId, handleDone);
  ftApi.getItem(itemId, handleDone);

  setTimeout()
  // ftApi.getPageList(handleDone);
  // ftApi.getPage(pageId, handleDone);
  // ftApi.getPageContent(pageId, handleDone);
})();
