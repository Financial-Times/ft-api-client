/*global console:true*/
var ftApi = require('./ftApi.js'),
	apiKey = "f65958a8e35bd14bc52f268b8b3ab4ad";

// Fetch a list of the latest notifications form the CAPI
function getNotifications () {
	"use strict";
	var config = {}, // Config to be used when the request is made
		notificationsFetcher;


	// Config can be set when a new GetChangesFromCapi object is created or when the request is made
	// The 'apiKey' and the 'since' date are required.
	config.apiKey					= apiKey; // Required, your API key
	//initConfig.aggregateResponse		= true; Optional, set by true default: Combine all the responses into an array and return them when 'loadComplete' fires
	//initConfig.apiDomain				= 'api.ft.com'; // Optional, set by default: The domain for the CAPI
	//initConfig.itemNotificationsPath	= '/content/notifications/v1/items'; // Optional, set by default
	//initConfig.apiUpdateDelay			= 125; // Optional, set by default: Time in ms between requests, used to control the speed of comms to the API
	//config.limit						= 20; // Optional, set by default: The number of items returned per request

	notificationsFetcher = ftApi.notifications;

	// The since date is required, should be in ISO format
	config.since = '2013-01-14T16:45:00z'; // Required

	// Get a list of modified articles from the CAPI
	notificationsFetcher.fetchItems(config);

	// A 'notificationsRequestComplete' event is fired after each request to the API
	notificationsFetcher.on('notificationsRequestComplete', function (notifications) {
		console.log('Notifcations request complete');
	});

	// When all requests have complete a 'loadComplete' is fired
	notificationsFetcher.on('loadComplete', function (aggregatedResponse) {
		// aggregateResponse = {
		//	resultsList: [] A list of objects where each object is a reso=ponse object form the CAPI
		//	totalResults: Int: The number of results, there may be a mismatch
		// }
		console.log(aggregatedResponse.resultsList.length, "of", aggregatedResponse.totalResults);

		// Flatten the list of notifcations returned from the API using the helper method from apiUtils
		var requestList = ftApi.utils.flattenNotificationsResponse(aggregatedResponse.resultsList);
		console.log(aggregatedResponse);
		getApiData(requestList);
	});

	// A request error of any sort emit a 'requestError' event
	notificationsFetcher.on('requestError', function (request) {
		console.log(request);
	});

}
getNotifications();


function getApiData (itemsList) {
	"use strict";
	var config = {},
		dataFetcher;

	// The only required config is the apiKey
	config.apiKey = apiKey;

	// Optionally:
	//config.aggregateResponse		= true; Optional, set true by default: Combine all the response and return them when 'loadComplete' fires
	//config.apiDomain				= 'api.ft.com'; // Optional, set by default: The domain for the CAPI
	//config.apiItemPath			= '/content/notifications/v1/items'; // Optional, set by default
	//config.apiUpdateDelay			= 125; // Optional, set by default: Time in ms between requests, used to control the speed of comms to the API

	// Create a new GetDataFromContentApi object and pass in any required config
	//dataFetcher = new ftApi.content.GetDataFromContentApi(config);

	// Request the content from the API. Content is fetched synchronously and throttled using the apiUpdateDelay property of config.
	// Pass an array of IDs
	//dataFetcher.getApiContent(itemsList);
	ftApi.content.getApiContent(itemsList, config);

	// An 'itemLoadComplete' event will fire after each item is successfully loaded
	ftApi.content.on('itemLoaded', function (data) {
		console.log('Individual request complete');
		//console.log(data);
	});

	// A load complete event will fire when all content is loaded.
	ftApi.content.on('allItemsLoaded', function (responseData) {
		// Returns a list of response CAPI response items
		console.log('All content loaded');
		//console.log(responseData);
	});
}





