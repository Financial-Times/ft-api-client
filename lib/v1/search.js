'use strict';
var request = require('request');
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api');
var v1      = require('./');

module.exports = function (term, quantity) {
    
    // FIXME All requests for pages are made via the public search API. This
    // keep us in line with the philosophy that everything is a stream. Maybe
    // that's not a client library decision though?

    if (term.indexOf('page:') === 0) {
        var pageName = term.split('page:');
        return v1.page.apply(this, [pageName[1]]);
    }    

    var self = this;
   
    var searchBodyTemplate = {
        "queryString":term,
        "queryContext":{
            "curations":["ARTICLES"]
        },
        "resultContext":{
            "aspects" : ["editorial","images","lifecycle","location","master","metadata","nature","summary","title"],
            "maxResults": quantity || 5,
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

    return v1.complexSearch.call(self, searchBodyTemplate);

};
