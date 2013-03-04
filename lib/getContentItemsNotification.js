/*global setTimeout:true, console:true */
var http			= require('https'),
	urlParser		= require('url'),
	apiUtils		= require('./apiUtils.js'),
	GetDataFromContentApi,
	apiConfig;


// Default configuration data, only the 'apiKey' and 'since' do not have default values
exports.config = {
	apiDomain:				'api.ft.com', // The domain for the content api
	itemNotificationsPath:	'/content/notifications/v1/items', // The path to retrieve notifications
	apiUpdateDelay:			125, // The delay in ms between requests, used to throttle the speed node talk to CAPI
	limit:					200, // How many items to return in a single request
	aggregateResponse:		true, // Aggregate the responses from the CAPI and return at the end of all the requests
	errorDelay:				10000 // If there is an error from the CAPI how long the app will wait before retrying
	//apiKey: Must be passed
	//since: Must be passed
};

exports.fetchItems = function (passedConfig, aggregateResponse) {
	"use strict";
	var	options,
		request,
		self = this;

	// Update the config with any new properties passed in
	this.config = apiUtils.mergeConfig(this.config, passedConfig);

	// The first time this method is called 'aggregateResponse' will not have been defined
	if (typeof aggregateResponse === 'undefined') {
		aggregateResponse = createAggregateResponseObj();
	}

	// Options for the node http request
	options = {
		host: this.config.apiDomain,
		path: getCapiPath(this.config),
		method: 'GET'
	};

	// Create a new request
	request = http.request(options);
	console.log(options.path);

	request.on('response', function (response) {
		var textResponse = '';
		console.log("Content API response: STATUS: " + response.statusCode);
		if (response.statusCode === 200) {
			response.setEncoding('utf8');

			// The resonse data will stream in
			response.on('data', function (chunk) {
				textResponse += chunk;
			});

			response.on('end', function () {
				handleRequestEnd(aggregateResponse, self, textResponse);
			});
		} else if (response.statusCode === 503) {
			// There was an error from the CAPI, probably transient
			// try again in a little while
			console.log('Response error, delaying for', self.config.errorDelay/1000, 'seconds');
			setTimeout(function () {
				self.fetchItems(self.config, aggregateResponse);
			}, self.config.errorDelay);
		} else {
			self.emit('requestError', response);
		}
	});

	// Catch an error with the request and re-init the app
	request.on('error', function(e) {
		console.log('Error with request:', e);
		self.emit('requestError', e);
	});

	// Close the request
	request.end();

};

function handleRequestEnd (aggregateResponse, notifObj, textResponse) {
	var notifications,
		jsonResponse;

	// Append to the list of results
	jsonResponse = JSON.parse(textResponse);
	notifications = jsonResponse.notifications;

	// If there is no aggregate response object create the skeleton object
	if (notifObj.config.aggregateResponse === true) {
		aggregateResponse.resultsList = aggregateResponse.resultsList.concat(notifications);
	}
	
	// Update the total number of results
	aggregateResponse.totalResults += jsonResponse.total;

	// Emit a 'notificationsRequestComplete' event so deal with run specific functionality
	notifObj.emit('notificationsRequestComplete', notifications);

	// Make another request if there are still more results to come
	if (notifications.length === notifObj.config.limit) {
		// Udate the config with the new date
		notifObj.config.since = getNewCapiDateFromPath(notifObj.config, jsonResponse.links[0].href);

		// Rate limit the requests to content API
		setTimeout(function () {
				notifObj.fetchItems(notifObj.config, aggregateResponse);
			}, notifObj.config.apiUpdateDelay);
	} else {
		// We are finished
		notifObj.emit('notificationsLoadComplete', aggregateResponse);
	}
}

// Create a skeleton response object
function createAggregateResponseObj () {
	var aggregateResponse = {};
	aggregateResponse.totalResults = 0;
	aggregateResponse.resultsList = [];
	return aggregateResponse;
}


// Return a constructed path in the format required by the CAPI
function getCapiPath (config) {
	var path;
	path = config.itemNotificationsPath + '?since=' + config.since + '&limit=' + config.limit + "&apiKey=" + config.apiKey;
	return path;
}

// Return the date portion of the next URL returned by the CAPI
// Uses the node URL module, handy
function getNewCapiDateFromPath (config, path) {
	"use strict";
	var parsedUrl = urlParser.parse(path, true),
		since = parsedUrl.query.since;
	return since;
}
