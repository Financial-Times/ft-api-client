'use strict';
var request = require('request');
var debug = require('debug')('ft-api-client:api');
var CapiError = require('../models/capi-error');


var determineEndpoint = function (url) {
	return url.indexOf('api.ft.com/content/items') > -1 ? 'items' :
			url.indexOf('api.ft.com/content/search') > -1 ? 'search' :
			url.indexOf('api.ft.com/site/v1/pages') > -1 ? 'pages' :
			url.indexOf(this.config.elasticSearchUri) > -1 ? 'elasticSearch' : 'unknown';
}


module.exports = function (url, method, body) {
	var endpoint = determineEndpoint.call(this, url);
	var opts = {
		headers: {
			'user-agent':   'https://github.com/Financial-Times/ft-api-client - v3.x',
			'content-type': 'application/json'
		},
		body: body,
		timeout: this.config.timeout,
		url: url
	};
	if (['search', 'items', 'pages'].indexOf(endpoint) > -1) {
		opts.qs = {
			apiKey: this.apikey,
			'feature.blogposts': 'on',
			'feature.usage': 'on'
		};
	}
	method = method || 'get';
	var requestStart = new Date();

	return new Promise(function (resolve, reject) {
		request[method](opts, function (err, response, body) {
			resolve({
				response: response,
				body: body,
				err: err
			});
		});
	})
	.then(function (result) {

		var responseTime = new Date() - requestStart;

		this.emit('ft-api-client:v1:' + endpoint + ':response', responseTime, result.response);

		var err;

		if (result.err) {
			err = new CapiError(503, err, url);
			debug('rejected - %s', url);
			this.emit('ft-api-client:v1:' + endpoint + ':response:rejected', err);
			throw err;
		}

		if (result.response.statusCode >= 400) {
			err = result.body;
			try {
				err = JSON.parse(err);
				err = err.message || err.errors[0].message;
			} catch (e) {
				err = result.body;
			}
			debug('rejected - %s, %s', url, err);
			err = new CapiError(result.response.statusCode, err, url);
			this.emit('ft-api-client:v1:' + endpoint + ':response:rejected', err);
			throw err;
		}

		try {
			var body = JSON.parse(result.body);
			this.emit('ft-api-client:v1:' + endpoint + ':response:resolved', err);
			return body;
		} catch (e) {
			err = new CapiError(503, 'error parsing JSON', url);
			debug('rejected - could not parse body response for %s', url);
			this.emit('ft-api-client:v1:' + endpoint + ':response:rejected', err);
			throw err;
		}
	}.bind(this));
};