'use strict';
var model = require('../../models');
var debug = require('debug')('ft-api-client:api:items');

module.exports = function (ids, opts) {

    var self = this;
    opts = opts || {};
        
    var promiseOfArticle = function(id) {

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
            if (opts.strict) {
                throw err;
            } else {
                return undefined;
            }
        });

    };

    debug('received a request to fetch %s', ids instanceof Array ? ids.join(', ') : ids);
    
    if (ids instanceof Array) {
        return Promise.all(ids.map(promiseOfArticle));

    } else {
        return promiseOfArticle(ids);
    }
};
