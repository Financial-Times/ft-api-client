'use strict';

var request = require('request');
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api:mget');
var getResponseError = require('./get-response-error');

module.exports = function (idList) {

    // Create the data structure required by elasticSearch
	var elasticSearchKey = this.config.elasticSearchKey;
	var data = {};
    var self = this;
    var elasticSearchUrl = 'http://paas:' + elasticSearchKey + '@bofur-us-east-1.searchly.com/v1Api/item/_mget';

	// Check for a string and convert to array
	if (typeof idList === 'string') {
		data.ids = idList.split();
	} else {
		data.ids = idList;
	}
	
	debug('fetching %s ids', data.ids.length);
        
    var requestStart = new Date();
    self.emit('ft-api-client:v1:elasticSearch:request');

	return new Promise (function (resolve, reject) {
		request({
			method: 'POST',
			body: JSON.stringify(data),
			url: elasticSearchUrl
		}, function (err, response, body) {
            
            err = getResponseError.call(self, {
                response: response, 
                err: err, 
                body: body, 
                requestStart: requestStart,
                method: 'elasticSearch',
                endpoint: elasticSearchUrl
            });
            if (err) {
                reject(err);
                return;
            }
            body = JSON.parse(body);
            // Return and article model for each item found
			var results = body.docs.filter(function (item) {
				return item.found ? true : false; 
			})
			.map(function (item) {
				return new model.Article(item._source);
			});

			// Return an array only if there is more than one item
			results = results.length === 1 ? results[0] : results;

            self.emit('ft-api-client:v1:elasticSearch:response:resolved');
			resolve(results);
		});
	});		
};
