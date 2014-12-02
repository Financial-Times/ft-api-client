'use strict';
var request = require('request');
var debug = require('debug')('ft-api-client:api');
var memoryCache = require('./cache.js');

module.exports = function (opts) {
    var self = this;
    var endpoint = opts.endpoint;

    return new Promise (function (resolve, reject) {

        // Is this item already cached?
        var cachedItem = memoryCache.get(endpoint);
        if (cachedItem) {
            debug('cache hit for %s', endpoint);
            cachedItem.cacheHit = true;
            return resolve(cachedItem);
        }

        self.emit('ft-api-client:v1:requestHandler:request', endpoint);
        request.get({
                url: endpoint,
                qs: {
                    apiKey: self.apiKey,
                    'feature.blogposts': 'on'
                },
                headers: self.headers,
                timeout: self.config.timeout
            }, function (err, response, body) {

                if (err) {
                    debug('rejected - %s, %s', endpoint, err);
                    return reject(err + ' (' + endpoint + ')');
                }
    
                self.emit('ft-api-client:v1:requestHandler:response');

                if (response.statusCode >= 400) {
                    err = body;
                    try {
                        err = JSON.parse(body);
                        err = err.message || err.errors[0].message;
                    } catch (e) {
                        err = body;
                    }
                    debug('rejected - %s, %s', endpoint, err);
                    return reject(err + ' (' + endpoint + ')');
                }
                
                try {
                    body = JSON.parse(body);
                    memoryCache.set(endpoint, body); // Add it to the cache, uses a global TTL atm
                    debug('resolved %s %s', endpoint, response.statusCode);
                    resolve(body);
                } catch (e) {
                    debug('rejected - could not parse body response for %s', endpoint);
                    reject('error parsing JSON (' + endpoint + ')');
                }
        });
    });

};
