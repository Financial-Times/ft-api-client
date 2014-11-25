'use strict';
var request = require('request');
var debug = require('debug')('ft-api-client:api');
var memoryCache = require('./cache.js');

module.exports = function (opts) {
	var self = this;
	var endpoint = opts.endpoint;
	return new Promise (function (resolve, reject) {

		// Is this item already cached?
		var cachedItem = memoryCache.get(endpoint);
		if (cachedItem) {
			debug('cache hit for %s', endpoint);
			cachedItem.cacheHit = true;
			return resolve(cachedItem);
		}

		request({
		        url: endpoint,
		        qs: {
		            apiKey: self.apiKey,
			    'feature.blogposts': 'on'
		        },
		        headers: self.headers,
		        timeout: 2000
		    }, function (err, response, body) {
		        if (err) {
		            debug('rejected - %s', endpoint);
		            return reject(err);
		        }
		        
		        debug('resolved %s %s', endpoint, response.statusCode);
		        
		        if (response.statusCode >= 400) {
		            resolve(undefined); // so as not to fail the Promise.all when we get a 4xx or 5xx we mask it
		        }

		        try {
		            body = JSON.parse(body);
		            memoryCache.set(endpoint, body); // Add it to the cache, uses a global TTL atm
		            resolve(body);
		        } catch (error) {
		            debug('rejected - could not parse body response for %s', endpoint);
		            reject('error parsing JSON');
		        }
		});
	});
};
