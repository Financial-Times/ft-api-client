
var request = require('request');
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api:search')
var page    = require('./page');

module.exports = function (term, quantity) {

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
                    headers: self.headers,
                    method: 'post',
                    body: JSON.stringify(searchBodyTemplate),
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
