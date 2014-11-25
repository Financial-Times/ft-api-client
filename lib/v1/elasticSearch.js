'use strict';
var request = require('request');
var memoryCache = require('./cache.js');

module.exports = function (idList) {
	// Create the data structure required by elasticSearch
	var elasticSearchKey = this.elasticSearchKey;
	var data = {};
	data.ids = idList;
	
	return new Promise (function (resolve, reject) {
		request({
			method: 'POST',
			json: true,
			body: data,
			url: 'http://paas:' + elasticSearchKey + '@bofur-us-east-1.searchly.com/v1Api/item/_mget'
		}, function (error, req, body) {
			if (!error && req.statusCode === 200) {
				// Iterate over the items found and them to the memory cache
				var cacheHits = body.docs.filter(function (item) {
					return item.found ? true : false; 
				});

				cacheHits.forEach(function (item) {
					memoryCache.set(item._source.requestUrl, item._source); // Add it to the cache, uses a global TTL atm
				});

				// Resolve with the list of successful cache items
				resolve(cacheHits);
			} else {
				reject(error);
			}
		});
	});		
};