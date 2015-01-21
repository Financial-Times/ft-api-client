'use strict';

var Article = require('../models/article');
var debug = require('debug')('ft-api-client:api:items');
var CapiError = require('../models/capi-error');
var memoryCache = require('../utils/cache.js');

module.exports = function (ids, opts) {

	var self = this;
	opts = opts || {};

	var promiseOfArticle = function(id, strict) {

		var url = 'http://api.ft.com/content/items/v1/' + id;

		debug('requested %s', url);

		// Is this item already cached?
		var cachedItem = memoryCache.get(url);
		if (cachedItem) {
			debug('cache hit for %s', url);
			cachedItem.cacheHit = true;
			return Promise.resolve(new Article(cachedItem));
		}

		return self.request(url)
			.then(function (body) {
				if (body === undefined) {
					// TODO: make model configurable as to which properties it cares about for a given request
					// Any errors to be thrown from the model and caught below
					throw 'Article body undefined (' + url + ')';
				}
				if (!body.item.lifecycle.lastPublishDateTime) {
					throw 'Article lastPublishDateTime undefined (' + url + ')';
				}
				// Add it to the cache, uses a global TTL atm
				memoryCache.set(url, body);
				return new Article(body);
			})
			.catch(function (err) {
				self.config.errorHandler(err);
				// need strict === true as when promiseOfArticle is called with [].map strict will be an integer
				if (strict === true || opts.strict) {
					throw err;
				} else {
					return undefined;
				}
			});

	};

	debug('received a request to fetch %s', ids instanceof Array ? ids.join(', ') : ids);
	this.emit('ft-api-client:v1:items:request', ids);

	if (ids instanceof Array) {

		return Promise.all(ids.map(promiseOfArticle)).then(function (articles) {
			if (!articles.some(function (a) {return a})) {
				throw new CapiError(503, 'no articles retrieved', ids);
			}
			return articles;
		});

	} else {
		return promiseOfArticle(ids, true);
	}
};
