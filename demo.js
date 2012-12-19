/*global console:true*/
var ftApi = require('./ftApi.js'),
	apiKey = "XXXXXXXX";

// Fetch a list of the latest notifications form the CAPI
function getNotifications () {
	"use strict";
	var config = {}, // Config to be used when the request is made
		initConfig = {}, // Config to be used when the object is initialised
		notificationsFetcher;


	// Config can be set when a new GetChangesFromCapi object is created or when the request is made
	// The 'apiKey' and the 'since' date are required.
	initConfig.apiKey					= apiKey; // Required, your API key
	//initConfig.aggregateResponse		= false; Optional, set by default: Combine all the response and return them when 'loadComplete' fires
	//initConfig.apiDomain				= 'api.ft.com'; // Optional, set by default: The domain for the CAPI
	//initConfig.itemNotificationsPath	= '/content/notifications/v1/items'; // Optional, set by default
	//initConfig.apiUpdateDelay			= 125; // Optional, set by default: Time in ms between requests, used to control the speed of comms to the API
	//config.limit						= 20; // Optional, set by default: The number of items returned per request

	notificationsFetcher = new ftApi.notifications.GetChangesFromCapi(initConfig);

	// The since date is required, should be in ISO format
	config.since = '2012-12-19T13:00:00z'; // Required

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
	//config.aggregateResponse		= false; Optional, set by default: Combine all the response and return them when 'loadComplete' fires
	//config.apiDomain				= 'api.ft.com'; // Optional, set by default: The domain for the CAPI
	//config.apiItemPath			= '/content/notifications/v1/items'; // Optional, set by default
	//config.apiUpdateDelay			= 125; // Optional, set by default: Time in ms between requests, used to control the speed of comms to the API

	// Create a new GetDataFromContentApi object and pass in any required config
	dataFetcher = new ftApi.content.GetDataFromContentApi(config);

	// Request the content from the API. Content is fetched synchronously and throttled using the apiUpdateDelay property of config.
	// Pass an array of IDs
	dataFetcher.getApiContent(itemsList);

	// An 'itemLoadComplete' event will fire after each item is successfully loaded
	dataFetcher.on('itemLoadComplete', function (data) {
		console.log('Individual request complete');
	});

	// A load complete event will fire when all content is loaded.
	dataFetcher.on('loadComplete', function (responseData) {
		// Returns a list of response CAPI response items
		console.log(responseData);
	});
}