'use strict';
var request = require('request');
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api:page');

module.exports = function (path, quantity) {
    
    var pageApiUrl = model.Pages.findByTitle(path);
    var self = this;
    function promiseOfPage () {
        return function (resolve, reject) {
            var endpoint = pageApiUrl.apiUrl + '/main-content';  
            request({
                    url: endpoint, 
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: self.headers,
                    timeout: 2000
                }, function (err, response, body) {
                        
                        if (err) {
                            debug('rejected - %s', endpoint);
                            return reject(err);
                        }
                        
                        debug('resolved %s %s', endpoint, response.statusCode);
                        
                        if (response.statusCode >= 400) {
                            resolve(undefined); // so as not to fail the Promise.all when we get a 4xx or 5xx we mask it
                        }
                        
                        try {
                            body = JSON.parse(body);
                        } catch (error) {
                            debug('rejected - could not parse body response for %s', endpoint);
                            return reject('error parsing JSON');
                        }
                    
                        // FIXME - handle 404 and/or no results
                        if (!body.pageItems) {
                            reject('no results found');
                            return;
                        }

                        resolve(body.pageItems.map( function (article) {
                                return new model.Article({ item: article }); // make it look like an normal Content API body
                            })
                        );
                });
            };
    }
    return new Promise(promiseOfPage(path));
};
