/*global setTimeout:true, console:true */
var http			= require('http'),
	apiUtils		= require('./apiUtils.js'),
	utils			= require('util'),
	EventEmitter	= require('events').EventEmitter,
	GetPagesFromContentApi;



GetPagesFromContentApi = function (passedConfig) {
	this.config = apiUtils.mergeConfig(this.config, passedConfig);
	console.log(this.config);
};

// Inherit from the event emittr so that we can emit cusotm events
utils.inherits(GetPagesFromContentApi, EventEmitter);

// Default configuration data, only the 'apiKey' and 'since' do not have default values
GetPagesFromContentApi.prototype.config = {
	apiDomain:				'api.ft.com',
	pagePath:				'/site/v1/pages/',
	apiUpdateDelay:			125,
	aggregateResponse:		true
	//apiKey:					null // Must be passed
	//since:
};


GetPagesFromContentApi.prototype.getPage = function (pageId, passedConfig) {
	"use strict";
	var req,
		options,
		self = this;

	// Update the config with any new properties passed in
	this.config = apiUtils.mergeConfig(this.config, passedConfig);
		

	// Options for the node http request
	options = {
		host: this.config.apiDomain,
		path: this.config.pagePath + pageId + '?apiKey=' + this.config.apiKey,
		method: 'GET'
	};

	console.log("Content API request: path: " + options.path);

	req = http.request(options);

	req.on('response', function (response) {
		var textResponse = '';
		console.log("Content API response: STATUS: " + response.statusCode);
		if (response.statusCode === 200) {
			response.setEncoding('utf8');

			// The resonse data will stream in
			response.on('data', function (chunk) {
				textResponse += chunk;
			});

			response.on('end', function () {
				if (pageId === '') {
					self.emit('pageListLoadComplete', JSON.parse(textResponse));
				} else {
					self.emit('pageLoadComplete', JSON.parse(textResponse));
				}
				
			});
		} else {
			self.emit('requestError', response);
		}
	});

	// Catch an error with the request and emit an error event
	req.on('error', function(e) {
		self.emit('requestError', req);
	});

	// Close the request
	req.end();
};

GetPagesFromContentApi.prototype.getPages = function (config) {
	this.getPage('', config);
};

exports.GetPagesFromContentApi = GetPagesFromContentApi;