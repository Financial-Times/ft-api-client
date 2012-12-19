/*global setTimeout:true, console:true */
var http			= require('http'),
	apiUtils		= require('./apiUtils.js'),
	utils			= require('util'),
	EventEmitter	= require('events').EventEmitter,
	GetDataFromContentApi;

GetDataFromContentApi = function (passedConfig) {
	this.config = apiUtils.mergeConfig(this.config, passedConfig);
	console.log(this.config);
};

// Inherit from the event emittr so that we can emit cusotm events
utils.inherits(GetDataFromContentApi, EventEmitter);

// A recursive method for fetching a list of items from the CAPI
// We call recusively for two reasons: We can control the speed of requests and we know when they have all finished
GetDataFromContentApi.prototype.getApiContent = function (itemsList, passedConfig) {
	"use strict";
	this.getApiItem(itemsList, 0, [], passedConfig);
};


// Default configuration data, only the 'apiKey' and 'since' do not have default values
GetDataFromContentApi.prototype.config = {
	apiDomain:				'api.ft.com',
	apiItemPath:			'/content/items/v1/',
	apiUpdateDelay:			125,
	aggregateResponse:		true
	//apiKey:					null // Must be passed
	//since:
};


GetDataFromContentApi.prototype.getApiItem = function (itemsList, position, responseData, passedConfig) {
	"use strict";
	var req,
		options,
		requestStartTimeInMs,
		self = this;

	// Update the config with any new properties passed in
	this.config = apiUtils.mergeConfig(this.config, passedConfig);

	if (position < itemsList.length) {
		
		console.log('Item: ', position + 1, ' of ', itemsList.length);

		// Options for the node http request
		options = {
			host: this.config.apiDomain,
			path: this.config.apiItemPath + itemsList[position] + '?apiKey=' + this.config.apiKey,
			method: 'GET'
		};

		console.log("Content API request: path: " + options.path);

		req = http.request(options);

		req.on('response', function (response) {
			var deps = {
				itemsList:				itemsList,
				position:				position,
				self:					self,
				responseData:			responseData,
				config:					this.config
			};
			handleCapiHttpResponse(response, deps);
		});

		// Catch an error with the request and emit an error event
		req.on('error', function(e) {
			self.emit('requestError', req);
		});

		// Close the request
		req.end();

	} else {
		// We have finished loading in the data from the content API
		self.emit('loadComplete', responseData);
	}
};


var handleCapiHttpResponse = function (response, deps) {
	"use strict";
	var jsonResponse			= '',
		itemsList				= deps.itemsList,
		self					= deps.self,
		position				= deps.position,
		responseData			= deps.responseData,
		config					= deps.config,
		responseItem;
	
	console.log("Content API response: STATUS: " + response.statusCode);

	if (response.statusCode === 200) {
		response.setEncoding('utf8');

		// The resonse data will stream in
		response.on('data', function (chunk) {
			jsonResponse += chunk;
		});

		response.on('end', function () {
			// Parse the text response to JSON
			responseItem = JSON.parse(jsonResponse);

			// Emit an event to single the completion of a single request and pass the response
			self.emit('itemLoadComplete', responseItem);

			// Add the response to the list of responses
			if (self.config.aggregateResponse === true) {
				responseData.push(responseItem);
			}

			// Update the counter and start another request
			position += 1;

			// Rate limit the requests to content API
			setTimeout(function () {
					self.getApiItem(itemsList, position, responseData, config);
				}, self.config.apiUpdateDelay);
		});
	} else {
		// Update the counter and start another request
		position += 1;

		// Rate limit the requests to content API
		setTimeout(function () {
				self.getApiItem(itemsList, position, responseData, config);
			}, self.config.apiUpdateDelay);
	}

};

exports.GetDataFromContentApi = GetDataFromContentApi;



