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
var getResponseError = require('./get-response-error');
var debug   = require('debug')('ft-api-client:api');
var v1      = require('./');
var responseBuilders = require('./response-builders');

var endpoint = 'http://api.ft.com/content/search/v1';

function complexSearch(requestBody){
    var self = this;

    self.emit('ft-api-client:v1:complexSearch:request', endpoint);
    var requestStart = new Date();
    
    return new Promise(function(resolve, reject) {
        debug('requested %s', endpoint);
        request.post({
            url: endpoint,
            qs: {
                apiKey: self.apiKey,
                'feature.blogposts': 'on'
            },
            headers: self.headers,
            body: JSON.stringify(requestBody),
            json: true,
            timeout: self.config.timeout
        }, function (err, response, body) {

            err = getResponseError.call(self, {
                response: response, 
                err: err, 
                body: body, 
                requestStart: requestStart,
                method: 'complexSearch',
                endpoint: endpoint
            });

            if (err) {
                reject(err);
                return;
            }

            debug('resolved %s %s', endpoint, response.statusCode);
            self.emit('ft-api-client:v1:complexSearch:response:resolved');
            resolve(body);

        }).then(responseBuilders.search);
    }).catch(function (err) {
        self.config.errorHandler(err);
    });
}

module.exports = complexSearch;
