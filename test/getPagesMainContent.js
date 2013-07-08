/*global console:true*/
var FtApi = require('../FtApi.js');

// Fetch a list of FT pages then get the content for each page
function getFtPages () {
  'use strict';
  var config = {},
    requestList = [
      '97afb0ce-d324-11e0-9ba8-00144feab49a',
      'c8406ad4-86e5-11e0-92df-00144feabdc0'
    ],
    ftApi = new FtApi('f65958a8e35bd14bc52f268b8b3ab4ad');

  // call getPageMainContent() to retrieve the main content for a page
  // Pass a list of IDs and any configuration data
  ftApi.content.getPageMainContent(requestList, config);

  // An 'pageLoaded' event will fire after each page is loaded
  ftApi.content.on('mainContentLoaded', function (data) {
    console.log('Individual request complete');
    console.log(data);
  });

  // A 'allPagesLoaded' event will fire when all pages are loaded.
  ftApi.content.on('allMainContentLoaded', function (responseData) {
    // Returns a list of response CAPI response items
    console.log(responseData);
  });
}
getFtPages();