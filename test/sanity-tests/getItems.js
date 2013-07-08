/*global console:true*/
'use strict';

var FtApi = require('../../FtApi.js');

function getApiData () {
  var itemsList = [
      '2eb9530a-5e6e-11e2-b3cb-00144feab49a',
      'becf9568-567a-11e2-aa70-00144feab49a'
    ],
    ftApi = new FtApi('f65958a8e35bd14bc52f268b8b3ab4ad');

  // Optionally:
  // Optional, set true by default: Combine responses and return them on 'loadComplete'
  //config.aggregateResponse    = true;
  // Optional, set by default: The domain for the CAPI
  //config.apiDomain        = 'api.ft.com';
  // Optional, set by default
  //config.apiItemPath      = '/content/notifications/v1/items';
  // Optional, set by default: Time in ms between requests, to control speed of comms
  //config.apiUpdateDelay      = 125;

  // Request the content from the API. Content is fetched synchronously and throttled
  // using the apiUpdateDelay property of config.
  // Pass an array of IDs
  ftApi.content.getApiContent(itemsList);

  // An 'itemLoaded' event will fire after each item is successfully loaded
  ftApi.content.on('itemLoaded', function (data) {
    console.log('Individual item loaded');
    console.log(data);
  });

  // An 'allItemsLoaded' event will fire when all content is loaded.
  ftApi.content.on('allItemsLoaded', function (responseData) {
    // Returns a list of response CAPI response items
    console.log('All items loaded');
    console.log(responseData);
  });
}
getApiData();