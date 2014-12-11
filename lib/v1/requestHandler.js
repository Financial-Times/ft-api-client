'use strict';
var request = require('request');
var getResponseError = require('./get-response-error');
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
                    'feature.blogposts': 'on',
                    'feature.usage': 'on'
                },
                headers: self.headers,
                json: true,
                timeout: self.config.timeout
            }, function (err, response, body) {
                err = getResponseError.call(self, {
                    response: response, 
                    err: err, 
                    body: body, 
                    requestStart: requestStart,
                    method: 'requestHandler',
                    endpoint: endpoint
                });

                if (err) {
                    reject(err);
                    return;
                }
                
                memoryCache.set(endpoint, body); // Add it to the cache, uses a global TTL atm
                debug('resolved %s %s', endpoint, response.statusCode);
                self.emit('ft-api-client:v1:requestHandler:response:resolved');
                resolve(body);
                
        });
    });

};
