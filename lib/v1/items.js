'use strict';
var model = require('../../models');
var debug = require('debug')('ft-api-client:api:items');
var CapiError = require('../../models/capi-error');

module.exports = function (ids, opts) {

    var self = this;
    opts = opts || {};
        
    var promiseOfArticle = function(id, strict) {

        var endpoint = 'http://api.ft.com/content/items/v1/' + id;
        
        debug('requested %s', endpoint);
        
        return self._request({
            endpoint: endpoint
        })
        .then(function (body) {
            if (body === undefined) {
                // TODO: make model configurable as to which properties it cares about for a given request
                // Any errors to be thrown from the model and caught below
                throw 'Article body undefined (' + endpoint + ')';
            } else {
                return new model.Article(body);
            }
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

    debug('received a request to fetch %s', ids instanceof Array ? ids.join(', ') : ids);
    this.emit('ft-api-client:v1:items', ids);
 
    if (ids instanceof Array) {

        return Promise.all(ids.map(promiseOfArticle)).then(function (articles) {
            if (!articles.some(function (a) {return a})) {
                throw new CapiError(503,'no articles retrieved', ids);
            }
            return articles;
        });

    } else {
        return promiseOfArticle(ids, true);
    }
};
