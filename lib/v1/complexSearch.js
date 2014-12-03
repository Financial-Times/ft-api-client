/*
*   This is the low-level search function used my other search methods
*   It is not very user-friendly and isn't currently in the public API
*   Call it with an object like this:
*
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
 };

 */
'use strict';

var request = require('request');
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api');
var v1      = require('./');

var endpoint = 'http://api.ft.com/content/search/v1';

function complexSearch(requestBody){
    var self = this;

    self.emit('ft-api-client:v1:complexSearch:request', endpoint);
    var requestStart = new Date();
    
    return new Promise(function(resolve, reject){
        debug('requested %s', endpoint);
        request.post({
            url: endpoint,
            qs: {
                apiKey: self.apiKey,
                'feature.blogposts': 'on'
            },
            headers: self.headers,
            body: JSON.stringify(requestBody),
            timeout: self.config.timeout
        }, function (err, response, body) {
   
            var responseTime = new Date() - requestStart;
            self.emit('ft-api-client:v1:complexSearch:response', responseTime, response);
            
            if (err) {
                debug('rejected - %s', endpoint);
                self.emit('ft-api-client:v1:complexSearch:rejected');
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
                self.emit('ft-api-client:v1:complexSearch:rejected');
                debug('rejected - %s, %s', endpoint, err);
                return reject(err + ' (' + endpoint + ')');
            }

            debug('resolved %s %s', endpoint, response.statusCode);

            try {
                body = JSON.parse(body);
            } catch (error) {
                debug('rejected - could not parse body response for %s', endpoint);
                self.emit('ft-api-client:v1:complexSearch:response:rejected');
                return reject('error parsing JSON (' + endpoint + ')');
            }

            // was a valid request, but had no results so don't reject just resolve with empty array
            if (body.results.length && !body.results[0].results) {
                self.emit('ft-api-client:v1:complexSearch:response:resolved');
                resolve({
                    articles:[],
                    meta:{ facets: [], indexCount: 0 }
                });
                return;
            }

            var articles = body.results[0].results.map(function (article) {
                return new model.Article({ item: article }); // make it look like a normal Content API body
            });

            var facets = [];

            if (body.results.length && body.results[0].facets) {
                facets = body.results[0].facets.map(function(facet) {
                    return new model.Facets(facet);
                });
            }
            
            self.emit('ft-api-client:v1:complexSearch:response:resolved');
            resolve({
                articles:articles,
                meta:{
                    facets:facets,
                    indexCount: body.results[0].indexCount
                }
            });
        
        
        
        })
    }).catch(function (err) {
        self.config.errorHandler(err);
    });
}

module.exports = complexSearch;
