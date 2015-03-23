'use strict';

var debug = require('debug')('ft-api-client:api');
var CapiError = require('../models/capi-error');
var fetchres = require('fetchres');

var determineEndpoint = function (url) {
	return url.indexOf('api.ft.com/content/items/v1') > -1 ? 'v1:items' :
			url.indexOf('api.ft.com/content/search/v1') > -1 ? 'v1:search' :
			url.indexOf('api.ft.com/site/v1/pages') > -1 ? 'v1:pages' :
			url.indexOf(this.config.elasticSearchUri) > -1 ? 'v1:elasticSearch' : 'unknown';
};


module.exports = function (url, method, body) {

	var endpoint = determineEndpoint.call(this, url);
	var opts = {
		headers: {
			'user-agent':   'https://github.com/Financial-Times/ft-api-client - v3.x',
			'content-type': 'application/json'
		},
		body: body,
		timeout: this.config.timeout,
		method: method || 'GET'
	};
	if (['v1:search', 'v1:items', 'v1:pages'].indexOf(endpoint) > -1) {
		var qs = 'apiKey=' + this.apikey + '&feature.blogposts=on&feature.usage=on'
		url += (url.indexOf('?') > -1 ? '&' : '?') + qs;
	}
	return fetch(url, opts)
		.then(function (result) {
			var err;
			if (result.status >= 400) {
				err = result.body;
				try {
					err = JSON.parse(err);
					err = err.message || err.errors[0].message;
				} catch (e) {
					err = result.body;
				}
				debug('rejected - %s, %s', url, err);
				err = new CapiError(result.status, err, url);
				this.emit('ft-api-client:' + endpoint + ':response:rejected', err);
				throw err;
			}
			return result;
		}.bind(this))
	.then(fetchres.json)
	.catch(function (err) {
		if (!err instanceof CapiError) {
			err = new CapiError(err.statusCode || 503, err, url);
		}
		debug('rejected - %s', url);
		this.emit('ft-api-client:' + endpoint + ':response:rejected', err);
		throw err;
	}.bind(this));
};
