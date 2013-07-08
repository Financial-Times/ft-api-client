// Fetch a list of FT pages then get the content for each page
/*global console:true*/
var FtApi = require('../../FtApi.js');

function getFtPages () {
  'use strict';

  var ftApi = new FtApi('f65958a8e35bd14bc52f268b8b3ab4ad');

  // Call getPages() to retrieve a list of all pages on the FT site. Only
  // a config object with the api key is required
  ftApi.content.getPages();

  ftApi.content.on('pageListLoaded', function (pageList) {
    console.log('Page list:', pageList);
  });
}
getFtPages();