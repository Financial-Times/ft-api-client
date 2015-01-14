'use strict';
var pages   = require('../models/pages');
var Article   = require('../models/article');
var debug   = require('debug')('ft-api-client:api:page');
var CapiError = require('../models/capi-error');
var pagesPoller = require('../jobs/pages');

function articleModelPromise (article, errorHandler, strict) {
	return new Promise(function (resolve, reject) {
		try {
			article = new Article({ item: article });
			resolve(article);
		} catch (err) {
			reject(err);
		}
	})
	.catch(function (err) {
		errorHandler(err);
		if (strict) {
			throw err;
		} else {
			return undefined;
		}
	});
}

module.exports = function (path, opts) {

	opts = opts || {};

	var pageMeta = pages.findByTitle(path);

	if (!pageMeta) {

		if (pagesPoller.get().length) {
			return Promise.reject(new CapiError(404, 'Page does not exist', path));
		} else {
			return Promise.reject(new CapiError(503, 'Pages list temporarily unavailable', path));
		}
	}
	var self = this;
	var url = pageMeta.apiUrl + '/main-content';

	debug('requested %s', url);
	self.emit('ft-api-client:v1:page:request');

	return this.request(url)
		.then(function (body) {
			if (!body.pageItems) {
				debug('no items in page (' + url + ')');
				return [];
			}

			if (opts.quantity) {
				body.pageItems = body.pageItems.splice(0, opts.quantity);
			}

			return Promise.all(
				body.pageItems.map(function (article) {
					return articleModelPromise(article, self.config.errorHandler, opts.strict);
				})
			);
		})
		.then(function (articles) {
			return {articles: articles};
		});
};
