'use strict';
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api:page');
var CapiError = require('../../models/capi-error');
var pagesPoller = require('../../jobs/pages');
function articleModelPromise (article, errorHandler, strict) {
    return new Promise(function (resolve, reject) {
        try {
            article = new model.Article({ item: article });
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

function promiseOfPage (path, opts) {
    var pageMeta = model.Pages.findByTitle(path);
    
    if (!pageMeta) {
    
        if (pagesPoller.get().length) {
            return Promise.reject(new CapiError({
                statusCode: 404,
                message: 'Page does not exist',
                context: path
            }))
        } else {
            return Promise.reject(new CapiError({
                statusCode: 503,
                message: 'Pages list temporarily unavailable',
                context: path
            }));
        }
    }
    var self = this;
    var endpoint = pageMeta.apiUrl + '/main-content';
        
    debug('requested %s', endpoint);

    return this._request({
        endpoint: endpoint
    })
    .then(function (body) {
        if (!body.pageItems) {
            debug('no items in page (' + endpoint + ')');
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
}

module.exports = function (path, opts) {

    opts = opts || {};

    return promiseOfPage.call(this, path, opts);
};
