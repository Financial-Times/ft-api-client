'use strict';
var model = require('../../models');
var debug = require('debug')('ft-api-client:api:items');
var memoryCache = require('./cache.js');
var apiBaseUrl = 'http://api.ft.com/content/items/v1/';
var searchCache = require('./elasticSearch.js');

module.exports = function (id) {

    var self = this;
        
    var promiseOfArticle = function(id) {
        return function(resolve, reject) {
            var endpoint = apiBaseUrl + id;
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
        // Create a list of un-cached items
        var uncachedItems = id.filter(function (item) {
            var cacheKey = apiBaseUrl + item;
            return memoryCache.get(cacheKey) ? false : true;
        });

        debug('There are %s uncached items', uncachedItems.length);
        
        // Update the cache with the missing items then return the array of promises
        return searchCache.updateCache(uncachedItems)
            .then(function (cachedItemList) {
                debug('Elastic search has cached %s items', cachedItemList.length);
                var promises = id.map(function (i) {
                    return new Promise(promiseOfArticle(i));
                });

                return Promise.all(promises);
            });
    } else {
        return new Promise(promiseOfArticle(id));
    }
};