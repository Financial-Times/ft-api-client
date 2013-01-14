/*global console:true*/
var ftApi = require('../ftApi.js');

// Fetch a list of FT pages, then fetch the UK home page
function getFtPageMainContent () {
	"use strict";
	var config = {
		apiKey: "f65958a8e35bd14bc52f268b8b3ab4ad" // Required, your API key
	}; 
	
	// Ease of use reference for fetching pages
	var ftPages = ftApi.content;

	ftPages.getPages(config);

	ftPages.on('pageListLoaded', function (pageList) {
		var requestList = ftApi.utils.flattenNotificationsResponse(pageList.pages);

		ftPages.getPageMainContent(requestList, config);

		// An 'itemLoadComplete' event will fire after each item is successfully loaded
		ftPages.on('mainContentLoaded', function (data) {
			console.log('Individual request complete');
		});

		// A load complete event will fire when all content is loaded.
		ftPages.on('allMainContentLoaded', function (responseData) {
			// Returns a list of response CAPI response items
			console.log(responseData);
		});
	});
}
getFtPageMainContent();