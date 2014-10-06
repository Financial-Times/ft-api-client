'use strict';
var request = require('request');
var debug = require('debug')('ft-api-client:api');

module.exports = function (opts) {
	var self = this;
	var endpoint = opts.endpoint;
	var resolve = opts.resolve;
	var cb = opts.cb;
	var reject = opts.reject;

	request({
	        url: endpoint,
	        qs: {
	            apiKey: self.apiKey
	        },
	        headers: self.headers,
	        timeout: 2000
	    }, function (err, response, body) {
	        
	        if (err) {
	            debug('rejected - %s', endpoint);
	            return opts.reject(err);
	        }
	        
	        debug('resolved %s %s', endpoint, response.statusCode);
	        
	        if (response.statusCode >= 400) {
	            resolve(undefined); // so as not to fail the Promise.all when we get a 4xx or 5xx we mask it
	        }

	        try {
	            body = JSON.parse(body);
	        } catch (error) {
	            debug('rejected - could not parse body response for %s', endpoint);
	            return reject('error parsing JSON');
	        }
	        cb(body);
	});
};