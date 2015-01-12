'use strict';

var Article   = require('../models/Article');
var debug   = require('debug')('ft-api-client:api:mget');

module.exports = function (idList) {

	var elasticSearchUri = this.config.elasticSearchUri;

	if (!elasticSearchUri) {
		return this.config.errorHandler('Can\'t perform a search without a search Uri configured');
	}

	// Create the data structure required by elasticSearch
	var data = {};
	var self = this;
	var url = elasticSearchUri + '/_mget';
	var singleItem = typeof idList === 'string';
	// Check for a string and convert to array
	if (singleItem) {
		data.ids = idList.split();
	} else {
		data.ids = idList;
	}

	debug('fetching %s ids', data.ids.length);

	self.emit('ft-api-client:v1:elasticSearch:request');

	return this.request(url, 'post', JSON.stringify(data))
		.then(function (body) {

			if (!body.docs) {
				throw 'No articles returned from elasticSearch';
			}
			// Return and article model for each item found
			var results = body.docs.filter(function (item) {
					return item.found ? true : false;
				})
				.map(function (item) {
					return new Article(item._source);
				});

			// Return an array only if there is more than one item
			results = singleItem ? results[0] : results;

			self.emit('ft-api-client:v1:elasticSearch:response:resolved');
			return results;
		}).catch(function (err) {
				self.config.errorHandler(err);
				// need strict === true as when promiseOfArticle is called with [].map strict will be an integer
				if (strict === true || opts.strict) {
					throw err;
				} else {
					return undefined;
				}
			});
};
