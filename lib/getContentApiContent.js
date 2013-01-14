/*global setTimeout:true, console:true */
var http			= require('http'),
	apiUtils		= require('./apiUtils.js'),
	GetDataFromContentApi;


// A recursive method for fetching a list of items from the CAPI
// We call recusively for two reasons: We can control the speed of requests and we know when they have all finished
exports.getApiContent = function (itemsList, passedConfig) {
	"use strict";
	// Update the config with any new properties passed in
	this.config = apiUtils.mergeConfig(this.config, passedConfig);

	var runtimeCfg = {
		makePath: function (config, id) {
			return config.apiItemPath + id + '?apiKey=' + config.apiKey;
		},
		eventNameMap: {
			singleItemLoaded: 'itemLoaded',
			allContentLoaded: 'allItemsLoaded'
		}
	};

	this.getApiItem(itemsList, 0, [], runtimeCfg);
};

// Get an individual page from the CAPI
exports.getPage = function (itemsList, passedConfig) {
	"use strict";
	// Update the config with any new properties passed in
	this.config = apiUtils.mergeConfig(this.config, passedConfig);

	var runtimeCfg = {
		makePath: function (config, id) {
			return config.pagePath + id + '?apiKey=' + config.apiKey;
		},
		eventNameMap: {
			singleItemLoaded: 'pageLoaded',
			allContentLoaded: 'allPagesLoaded'
		}
	};
	runtimeCfg.makePath(this.config, 'dasdadasda');

	this.getApiItem(itemsList, 0, [], runtimeCfg);
};

// Get and individual page from the CAPI
exports.getPageMainContent = function (itemsList, passedConfig) {
	"use strict";
	// Update the config with any new properties passed in
	this.config = apiUtils.mergeConfig(this.config, passedConfig);

	var runtimeCfg = {
		makePath: function (config, id) {
			return config.pagePath + id + config.pageMainContent + '?apiKey=' + config.apiKey;
		},
		eventNameMap: {
			singleItemLoaded: 'mainContentLoaded',
			allContentLoaded: 'allMainContentLoaded'
		}
	};
	
	this.getApiItem(itemsList, 0, [], runtimeCfg);
};

// Get a list pf pages from the CAPI
exports.getPages = function (passedConfig) {
	"use strict";
	// Update the config with any new properties passed in
	this.config = apiUtils.mergeConfig(this.config, passedConfig);

	var runtimeCfg = {
		makePath: function (config, id) {
			return config.pagePath + '?apiKey=' + config.apiKey;
		},
		eventNameMap: {
			singleItemLoaded: 'pageListLoaded',
			allContentLoaded: 'pageListLoadedComplete'
		}
	};
	
	this.getApiItem([''], 0, [], runtimeCfg);
};

// Default configuration data, only the 'apiKey' and 'since' do not have default values
exports.config = {
	apiDomain:				'api.ft.com',
	apiItemPath:			'/content/items/v1/',
	pagePath:				'/site/v1/pages/',
	pageMainContent:		'/main-content',
	apiUpdateDelay:			125,
	aggregateResponse:		true
};


exports.getApiItem = function (itemsList, position, responseData, runtimeCfg) {
	"use strict";
	var req,
		options,
		requestStartTimeInMs,
		self = this;

	if (position < itemsList.length) {
		
		console.log('Item: ', position + 1, ' of ', itemsList.length);

		// Options for the node http request
		options = {
			host: this.config.apiDomain,
			path: runtimeCfg.makePath(this.config, itemsList[position]),
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
				config:					this.config,
				runtimeCfg:				runtimeCfg
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
		self.emit(runtimeCfg.eventNameMap.allContentLoaded, responseData);
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
		runtimeCfg				= deps.runtimeCfg,
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
			self.emit(runtimeCfg.eventNameMap.singleItemLoaded, responseItem);

			// Add the response to the list of responses
			if (self.config.aggregateResponse === true) {
				responseData.push(responseItem);
			}

			// Update the counter and start another request
			position += 1;

			// Rate limit the requests to content API
			setTimeout(function () {
					self.getApiItem(itemsList, position, responseData, runtimeCfg);
				}, self.config.apiUpdateDelay);
		});
	} else {
		// Update the counter and start another request
		position += 1;

		// Log the non 200 reponse
		logNon200Response(response.statusCode);

		// Rate limit the requests to content API
		setTimeout(function () {
				self.getApiItem(itemsList, position, responseData, runtimeCfg);
			}, self.config.apiUpdateDelay);
	}

};

// If we did not get a 200 analyse the response code and output a suitable message
var logNon200Response = function (statusCode) {
	switch (statusCode) {
		case 403:
			console.log("Content API response: STATUS: ", statusCode, 'CAPI does not have this content');
			break;
		case 429:
			console.log("Content API response: STATUS: ", statusCode, 'Too many resuests, slow down!');
			break;
		case 500:
			console.log("Content API response: STATUS: ", statusCode, 'Internal server error');
			break;
		case 410:
			console.log("Content API response: STATUS: ", statusCode, 'Resource no longer exists');
			break;
		case 503:
			console.log("Content API response: STATUS: ", statusCode, 'The server is currently unable to handle the request, due to temporary overloading or maintenance of the server');
			break;
		case 403:
			console.log("Content API response: STATUS: ", statusCode, 'Forbidden');
			break;
		case 401:
			console.log("Content API response: STATUS: ", statusCode, 'The request requires user authentication. Typically this means a valid apiKey has not been supplied');
			break;
		case 400:
			console.log("Content API response: STATUS: ", statusCode, 'The request could not be understood by the server due to malformed syntax');
			break;
	}
	
};
