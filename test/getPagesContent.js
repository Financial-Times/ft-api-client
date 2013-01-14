/*global console:true*/
var ftApi = require('../ftApi.js');
	

// Fetch a list of FT pages then get the content for each page
function getFtPages () {
	"use strict";
	var config = {
		apiKey: "f65958a8e35bd14bc52f268b8b3ab4ad" // Required, your API key
	}; 
	
	var ftPages = ftApi.content;

	ftPages.getPages(config);

	ftPages.on('pageListLoaded', function (pageList) {
		console.log('Page list:', pageList);

		var requestList = ftApi.utils.flattenNotificationsResponse(pageList.pages);

		ftPages.getPage(requestList, config);

		// An 'itemLoadComplete' event will fire after each item is successfully loaded
		ftPages.on('pageLoaded', function (data) {
			console.log('Individual request complete');
			console.log(data);
		});

		// A load complete event will fire when all content is loaded.
		ftPages.on('allPagesLoaded', function (responseData) {
			// Returns a list of response CAPI response items
			console.log(responseData);
		});
	});


}
getFtPages();