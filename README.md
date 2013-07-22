Sample usage for the FT API Node Client
======================================
To find out how to use the FT content API go to <https://developer.ft.com>

Instantiating the Client
-------------
The client is implemented as an instantiable FtApi object.
Create a client instance by calling FtApi as a constructor and passing your api key:

	var FtApi = require('ft-api-client'),
		ftApi;
	ftApi = new FtApi('APIKEY');

You can pass an optional log level argument to the constructor too.
	ftApi = new FtApi('APIKEY', FtApi.LOG_LEVEL_NONE);

Logging Levels
-------------
The API has three logging levels:
    LOG_LEVEL_NONE - Logs no info messages and no errors
    LOG_LEVEL_ERROR - Logs only errors, to stderr
    LOG_LEVEL_INFO - Logs errors to stderr and info messages to stdout
By default, instances have LOG_LEVEL_ERROR.

Logging levels can be set from the FT API constructor, or using getLogLevel/setLogLevel
 on an FtApi instance.

	ftApi = new FtApi('APIKEY', FtApi.LOG_LEVEL_NONE);
	ftApi.setLogLevel(FtApi.LOG_LEVEL_INFO);

Fetching a list of recently updated items
-------------
This example will get all notifications from the last hour

	var FtApi = require('ft-api-client'),
		ftApi,
		now,
		oneHourAgo;

	// Create a new Api Client from your API Key
	ftApi = new FtApi('XXX');

	// Create a date object for an hour ago
	now = new Date();
	oneHourAgo = new Date((now.valueOf() - (3600 * 1000)));

	// Get a list of all notifications in the last hour
	ftApi.getNotificationsSince(oneHourAgo, function (errors, notifications) {
		if (errors) {
			console.log('Request error occurred:', errors);
		} else {
			console.log('Notifications retrieved:', notifications);
		}
	});

This example will return up to 10 notifications from the last 15 minutes (api default)

	var FtApi = require('ft-api-client'),
		ftApi;

	// Create a new Api Client from your API Key
	ftApi = new FtApi('XXX');

	// Get a list of the last 10 modified items from the last 15 minutes (api default)
	ftApi.getNotificationsUpTo(10, function (error, body) {
		if (error) {
			console.log('Request error occurred:', error);
		} else {
			console.log('Notifications retrieved:', body.notifications);
		}
	});

Fetching the data for *n* number of content IDs
-------------
This example will return the full data for each ID specfied
Note: The 'handle all items' callback is optional.

	var FtApi = require('ft-api-client'),
		ftApi,
		itemIds = [
			'2eb9530a-5e6e-11e2-b3cb-00144feab49a',
			'becf9568-567a-11e2-aa70-00144feab49a'
		],
		handleItemResponse,
		handleAllItems;

	handleItemResponse = function (error, item) {
		if (error) {
			console.log('Error loading item: ', error);
		} else {
			console.log('Item Loaded: ', item);
		}
	}

	handleAllItems = function (errors, items) {
		if (errors) {
			console.log('Errors occurred loading items: ', errors);
		}
		console.log('Items loaded were: ', items);
	};

	// Create a new Api Client from your API Key
	ftApi = new FtApi('XXX');

	// Get the items for the given item ids
	ftApi.getItems(itemIds, handleItemResponse, handleAllItems);


Fetching a list of FT pages 
-------------
List all pages available on www.ft.com.

	var FtApi = require('ft-api-client'),
		ftApi;

	// Create a new Api Client from your API Key
	ftApi = new FtApi('XXX');

	// And get the page list
	ftApi.getPageList(function (errors, pageList) {
		if (errors) {
			console.log('Request error occurred:', errors);
		} else {
			console.log('Page list retrieved:', pageList);
		}
	});


Fetching an FT page
-------------
Get a page available on www.ft.com. Provides the page id, title, apiUrl, webUrl and a link to retrieve the main items of content listed on the page.
Note: The 'handle all pages' callback is optional.

	var FtApi = require('ft-api-client'),
		ftApi,
		pageIds = [
		'97afb0ce-d324-11e0-9ba8-00144feab49a',
		'c8406ad4-86e5-11e0-92df-00144feabdc0'
		],
		handlePageResponse,
		handleAllPages;

	// Create a new Api Client from your API Key
	ftApi = new FtApi('XXX');

	handlePageResponse = function (error, page) {
		if (error) {
		console.log('Error loading page: ', error);
		} else {
		console.log('Page Loaded: ', page);
		}
	}

	handleAllPages = function (errors, pages) {
		if (errors) {
		console.log('Errors occurred loading pages: ', errors);
		}
		console.log('Pages loaded were: ', pages);
	};

	// And get the pages for the IDs
	ftApi.getPages(pageIds, handlePageResponse, handleAllPages);


Fetching an FT page main content
-------------
List all page items available on a published www.ft.com page.

	var FtApi = require('ft-api-client'),
		ftApi,
		pageId = '97afb0ce-d324-11e0-9ba8-00144feab49a',
		handlePageContent;

	// Create a new Api Client from your API Key
	ftApi = new FtApi('XXX');

	handlePageContent = function (error, pageContent) {
		if (error) {
		console.log('Error loading page: ', error);
		} else {
		console.log('Page content loaded: ', pageContent);
		}
	}

	// And get the page main content for the IDs
	ftApi.getPageContent(pageId, handlePageContent);
