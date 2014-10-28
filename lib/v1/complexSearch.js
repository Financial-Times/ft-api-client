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

function curry(){
    var func = arguments[0],
        args = [].slice.call(arguments, 1),
        context = this;

    return function(){
        var allArgs = args.concat([].slice.call(arguments, 0));
        return func.apply(context, allArgs);
    }
}

function onResponse (resolve, reject, err, response, body){
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

    // was a valid request, but had no results so don't reject just resolve with empty array
    if(body.results.length && !body.results[0].results){
        resolve({articles:[],meta:{facets:[]}});
        return;
    }

    var articles = body.results[0].results.map( function (article) {
        return new model.Article({ item: article }); // make it look like an normal Content API body
    });

    var facets = [];

    if(body.results.length && body.results[0].facets){
        facets = body.results[0].facets.map( function( facet){
            return new model.Facets(facet);
        });
    }

    resolve({articles:articles, meta:{facets:facets}});
}

function complexSearch(requestBody){
    var callback;
    var self = this;

    return new Promise(function(resolve, reject){
       callback = curry(onResponse, resolve, reject);

        debug('requested %s', endpoint);
        request({
            url: endpoint,
            qs: {
                apiKey: self.apiKey,
		'feature.blogposts': 'on'
            },
            headers: self.headers,
            method: 'post',
            body: JSON.stringify(requestBody),
            timeout: 2000
        }, callback);
    });
}

module.exports = complexSearch;
