'use strict';
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api:page');

function articleModelPromise (articleData, errorHandler, alwaysResolve) {
    return new Promise(function (resolve, reject) {
        try {
            resolve(new model.Article({ item: article }));
        } catch (err) {
            reject(err);
        }
    })
    .catch(function (err) {
        errorHandler(err);
        if (alwaysResolve) {
            return undefined;
        } else {
            throw err;
        }
    });
}

function promiseOfPage (path, opts) {

    var pageApiUrl = model.Pages.findByTitle(path);
    var self = this;

    return new Promise(function (resolve, reject) {
        var endpoint = pageApiUrl.apiUrl + '/main-content';
        debug('requested %s', endpoint);
        self._request({
            endpoint: endpoint
        })
        .then(function (body) {

            if (!body.pageItems) {
                debug('no items in page (' + endpoint + ')');
                resolve([]);
                return;
            }

            if (opts.quantity) {
                body.pageItems = body.pageItems.splice(0, opts.quantity);
            }

            Promise.all(
                body.pageItems.map(function (article) {
                    return articleModelPromise(article, self.config.errorHandler, opts.alwaysResolve);
                })
            ).then(resolve, reject);
        })
        .then(function (articles) {
            return {articles: articles};
        });

    });
}

module.exports = function (path, opts) {

    opts = opts || {};

    return promiseOfPage.call(this, path, opts);
};
