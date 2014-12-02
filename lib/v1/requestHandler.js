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

        var requestStart = new Date();

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

                var responseTime = new Date() - requestStart;
                self.emit('ft-api-client:v1:requestHandler:response', responseTime, response);
                
                if (err) {
                    debug('rejected - %s, %s', endpoint, err);
                    self.emit('ft-api-client:v1:requestHandler:response:rejected');
                    return reject(err + ' (' + endpoint + ')');
                }

                if (response.statusCode >= 400) {
                    err = body;
                    try {
                        err = JSON.parse(body);
                        err = err.message || err.errors[0].message;
                    } catch (e) {
                        err = body;
                    }
                    debug('rejected - %s, %s', endpoint, err);
                    self.emit('ft-api-client:v1:requestHandler:response:rejected');
                    return reject(err + ' (' + endpoint + ')');
                }
                
                try {
                    body = JSON.parse(body);
                    memoryCache.set(endpoint, body); // Add it to the cache, uses a global TTL atm
                    debug('resolved %s %s', endpoint, response.statusCode);
                    self.emit('ft-api-client:v1:requestHandler:response:resolved');
                    resolve(body);
                } catch (e) {
                    debug('rejected - could not parse body response for %s', endpoint);
                    self.emit('ft-api-client:v1:requestHandler:response:rejected');
                    reject('error parsing JSON (' + endpoint + ')');
                }
        });
    });

};
