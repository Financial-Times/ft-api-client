'use strict';
var request = require('request');
var model = require('../../models');

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
				// Return and article model for each item found
				var results = body.docs.filter(function (item) {
					return item.found ? true : false; 
				})
				.map(function (item) {
					return new model.Article(item._source);
				});

				// Resolve with the list of successful cache items
				resolve(results);
			} else {
				reject(error);
			}
		});
	});		
};