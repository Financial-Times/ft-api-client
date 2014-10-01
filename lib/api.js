'use strict';

var request = require('request');
var model = require('../models');
var _ = require('lodash');
var debug = require('debug')('ft-api-client:api')

var headers = { 
    'user-agent':   'https://github.com/Financial-Times/ft-api-client - v3.x',
    'content-type': 'application/json'
};

var FtApi = function (apikey) {
    this.apiKey = apikey;
}; 


FtApi.prototype.search = function (term, quantity) {
    
    // Divert to getting a page
    if (term.indexOf('page:') === 0) {
        var pageName = term.split('page:');
        return this.getPage(pageName[1]);
    }    

    var self = this;
   
    var searchBodyTemplate = {
            "queryString":"",
            "queryContext":{
                "curations":["ARTICLES"]
            },
            "resultContext":{
                "aspects" : ["editorial","images","lifecycle","location","master","metadata","nature","summary","title"],
                "maxResults": 5,
                "offset":0,
                "contextual": true,
                "highlight": false,
                "facets":{
                    "names":["organisations"],
                    "maxElements":-1,
                    "minThreshold":100
                }
            }
        };

    var promiseOfSearch = function(term, quantity) {
        return function(resolve, reject) {
            
            searchBodyTemplate.queryString += term;
            searchBodyTemplate.resultContext.maxResults = quantity || 5;

            var endpoint = 'http://api.ft.com/content/search/v1';
            
            debug('requested %s', endpoint);
            
            request({
                    url: endpoint, 
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: headers,
                    method: 'post',
                    body: JSON.stringify(searchBodyTemplate)
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
                    if (!body.results) {
                        reject('no results found');
                        return;
                    }

                    resolve(body.results[0].results.map( function (article) {
                            return new model.Article({ item: article }); // make it look like an normal Content API body
                        })
                    );
            });
        };
    };
    return new Promise(promiseOfSearch(term, quantity));
};

/**
 * Gets one or more resources from the ApI
 */
FtApi.prototype.get = function (id) {

    var self = this;
        
    var promiseOfArticle = function(id) {
        return function(resolve, reject) {
            
            var endpoint = 'http://api.ft.com/content/items/v1/' + id;
            
            debug('requested %s', endpoint);
            
            request({
                    url: endpoint,
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: headers
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
                    
                    resolve(new model.Article(body));
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


FtApi.prototype.getPages = function () {
    var self = this;
    function promiseOfPages () {
        return function (resolve, reject) {
            request({
                url: 'http://api.ft.com/site/v1/pages',
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: headers
                }, function (err, response, body) {
                        if (err) return reject(err);

                        if (response.statusCode >= 400) {
                            resolve(undefined);
                        }

                        try {
                            body = JSON.parse(body);
                        } catch (error) {
                            return reject('error parsing JSON');
                        }
                        
                        resolve(body);
                });
            };
    }
    // Return the list of pages
    return new Promise(promiseOfPages());
};

FtApi.prototype.getPage = function (path) {
    var pageApiUrl = model.Pages.getItemByTitle(path);
    var self = this;
    
    function promiseOfPage () {
        return function (resolve, reject) {
            request({
                url: pageApiUrl + '/main-content',
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: headers
                }, function (err, response, body) {
                        var idList;
                        if (err) return reject(err);

                        if (response.statusCode >= 400) {
                            resolve(undefined);
                        }
                        // TODO sort out this mess!
                        try {
                            body = JSON.parse(body);
                            idList = _.map(body.pageItems, function (item) {
                                        return item.id;
                                    });
                        } catch (error) {
                            return reject('error parsing JSON');
                        }
                        resolve(idList);
                });
            };
    }
    return new Promise(promiseOfPage(path));
};


/**
 * Export
 */
module.exports = function (apikey) {
    return new FtApi(apikey);
};


