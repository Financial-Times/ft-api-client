'use strict';
var model = require('../../models');
var debug = require('debug')('ft-api-client:api:items');

module.exports = function (id) {

    var self = this;
        
    var promiseOfArticle = function(id) {
        return function(resolve, reject) {
            var endpoint = 'http://api.ft.com/content/items/v1/' + id;
            debug('requested %s', endpoint);
            self._request({
                endpoint: endpoint
            })
            .then(function (body) {
                if (body === undefined) {
                    resolve(undefined);
                } else {
                    resolve(new model.Article(body));    
                }
            })
            .catch(function (e) {
                reject(e);
            });
        };
    };

    debug('received a request to fetch %s', id);
    
    if (id instanceof Array) {
        var promises = id.map(function (i) {
            return new Promise(promiseOfArticle(i));
        });
        return Promise.all(promises);
    } else {
        return new Promise(promiseOfArticle(id));
    }
};
