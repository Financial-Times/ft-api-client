'use strict';
var request = require('request');
var model = require('../../models');
var debug = require('debug')('ft-api-client:api:mget');

module.exports = function (idList) {
	// Create the data structure required by elasticSearch
	var elasticSearchKey = this.config.elasticSearchKey;
	var data = {};

	// Check for a string and convert to array
	if (typeof idList === 'string') {
		data.ids = idList.split();
	} else {
		data.ids = idList;
	}
	
	debug('fetching %s ids', data.ids.length);

	return new Promise (function (resolve, reject) {
		request({
			method: 'POST',
			json: true,
			body: data,
			url: 'http://paas:' + elasticSearchKey + '@bofur-us-east-1.searchly.com/v1Api/item/_mget'
		}, function (error, req, body) {
			if (!error && req.statusCode === 200) {
				// Return and article model for each item found
				var results = body.docs.filter(function (item) {
					return item.found ? true : false; 
				})
				.map(function (item) {
					return new model.Article(item._source);
				});

				// Return an array only if there is more than one item
				results = results.length === 1 ? results[0] : results;

				resolve(results);
			} else {
				reject(error);
			}
		});
	});		
};