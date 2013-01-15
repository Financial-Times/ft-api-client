Sample usage for the ftApi node client
======================================
To find out how to use the FT content API go to <https://developer.ft.com>


Fetching a list of updated items from a specific point in time
-------------
This example will return a list of IDs

	var ftApi = require('ft-api-client');

	// Fetch a list of the latest notifications form the CAPI
	function getNotifications () {
		"use strict";
		// The 'apiKey' and the 'since' date are required.
		var config = {
				apiKey: "XXXXX",
				since: '2013-01-14T11:40:00z' // Required should be in ISO format
			};

		// Optional parameters which override the defaults
		//initConfig.aggregateResponse		= true; Optional, set by true default: Combine all the responses into an array and return them when 'notificationsLoadComplete' fires
		//initConfig.apiDomain				= 'api.ft.com'; // Optional, set by default: The domain for the CAPI
		//initConfig.itemNotificationsPath	= '/content/notifications/v1/items'; // Optional, set by default
		//initConfig.apiUpdateDelay			= 125; // Optional, set by default: Time in ms between requests, used to control the speed of comms to the API
		//config.limit						= 200; // Optional, set by default: The number of items returned per request


		// Get a list of modified articles from the CAPI
		ftApi.notifications.fetchItems(config);

		// A 'notificationsRequestComplete' event is fired after each request to the API
		ftApi.notifications.on('notificationsRequestComplete', function (notificationsList) {
			console.log('notificationsRequestComplete');
		});

		// A 'notificationsLoadComplete' event is fired after all the requests have been made
		ftApi.notifications.on('notificationsLoadComplete', function (aggregatedResponse) {
			console.log('notificationsLoadComplete');
		});

		// A request error of any sort emit a 'requestError' event
		ftApi.notifications.on('requestError', function (request) {
			console.log(request);
		});

	}
	getNotifications();

Fetching the data for *n* number of content IDs
-------------
This example will return the full data for each ID specfied

	var ftApi = require('ft-api-client');
	function getApiData () {
		"use strict";
		var config = {
				apiKey: "XXXXX"
			},
			itemsList = ['2eb9530a-5e6e-11e2-b3cb-00144feab49a', 'becf9568-567a-11e2-aa70-00144feab49a'];

		// Optionally:
		//config.aggregateResponse		= true; Optional, set true by default: Combine all the response and return them when 'loadComplete' fires
		//config.apiDomain				= 'api.ft.com'; // Optional, set by default: The domain for the CAPI
		//config.apiItemPath			= '/content/notifications/v1/items'; // Optional, set by default
		//config.apiUpdateDelay			= 125; // Optional, set by default: Time in ms between requests, used to control the speed of comms to the API

		// Request the content from the API. Content is fetched synchronously and throttled using the apiUpdateDelay property of config.
		// Pass an array of IDs
		ftApi.content.getApiContent(itemsList, config);

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

Fetching a list of FT pages 
-------------
List all pages available on www.ft.com.

	var ftApi = require('ft-api-client');
	function getFtPages () {
		"use strict";
		var config = {
			apiKey: "XXXXX" // Required, your API key
		}; 
		
		// Call getPages() to retrieve a list of all pages on the FT site. Only 
		// a config object with the api key is required
		ftApi.content.getPages(config);

		ftApi.content.on('pageListLoaded', function (pageList) {
			console.log('Page list:', pageList);
		});
	}
	getFtPages();


Fetching an FT page
-------------
Get a page available on www.ft.com. Provides the page id, title, apiUrl, webUrl and a link to retrieve the main items of content listed on the page.

	var ftApi = require('ft-api-client');
	// Fetch a list of FT pages then get the content for each page
	function getFtPages () {
		"use strict";
		var config = {
				apiKey: "XXXXXXX" // Required, your API key
			},
			requestList = ['97afb0ce-d324-11e0-9ba8-00144feab49a', 'c8406ad4-86e5-11e0-92df-00144feabdc0'];

		ftApi.content.getPage(requestList, config);

		// A 'pageLoaded' event will fire after each page is loaded
		ftApi.content.on('pageLoaded', function (data) {
			console.log('Individual request complete');
			console.log(data);
		});

		// A 'allPagesLoaded' event will fire when all pages are loaded.
		ftApi.content.on('allPagesLoaded', function (responseData) {
			// Returns a list of response CAPI response items
			console.log(responseData);
		});
	}
	getFtPages();

Fetching an FT page main content
-------------
List all page items available on a published www.ft.com page.

	// Fetch a list of FT pages then get the content for each page
	function getFtPages () {
		"use strict";
		var config = {
				apiKey: "XXXXXX" // Required, your API key
			},
			requestList = ['97afb0ce-d324-11e0-9ba8-00144feab49a', 'c8406ad4-86e5-11e0-92df-00144feabdc0'];

		// call getPageMainContent() to retrieve the main content for a page
		// Pass a list of IDs and any configuration data
		ftApi.content.getPageMainContent(requestList, config);

		// A 'mainContentLoaded' event will fire after each page is loaded
		ftApi.content.on('mainContentLoaded', function (data) {
			console.log('Individual request complete');
			console.log(data);
		});

		// A 'allMainContentLoaded' event will fire when all pages are loaded.
		ftApi.content.on('allMainContentLoaded', function (responseData) {
			// Returns a list of response CAPI response items
			console.log(responseData);
		});
	}
	getFtPages();