/*global console:true*/
var ftApi = require('../ftApi.js');

// Fetch a list of the latest notifications form the CAPI
function getNotifications () {
	"use strict";
	// The 'apiKey' and the 'since' date are required.
	var config = {
			apiKey: "f65958a8e35bd14bc52f268b8b3ab4ad",
			since: '2013-03-03T11:40:00z' // Required should be in ISO format TODO, make this the current date - 1 day
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