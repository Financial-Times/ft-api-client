'use strict';
var page = require('./page');
var Article   = require('../models/Article');
var Facet   = require('../models/Facet');
var defaultResultContext = {
    aspects: ["editorial","images","lifecycle","location","master","metadata","nature","summary","title"],
    maxResults: 5,
    offset: 0,
    contextual: true,
    highlight: false,
    facets:{
        names:["organisations", "regions", "sections", "topics"],
        maxElements: 5,
        minThreshold: 100
    }
};

var endpoint = 'http://api.ft.com/content/search/v1';

var setResultContext = function (overrides) {
    if (!overrides)  {
        return defaultResultContext;
    }
    var base = JSON.parse(JSON.stringify(defaultResultContext));
    Object.keys(overrides).forEach(function (key) {
        overrideContextProp(base, key, overrides[key]);
    });
    return base;
};

var overrideArray = function (obj, key, overrides, additive) {
    if (additive) {
       obj[key] = obj[key].concat(overrides);
    } else {
       obj[key] = overrides;
    }
};

var overrideContextProp = function (obj, key, overrides) {
    var additive;
    if (key.charAt(0) === '+') {
        additive = true;
        key = key.substr(1);
        overrides[key] = overrides['+' + key];
    }
    if (typeof obj[key] === 'undefined' || typeof obj[key] !== 'object') {
        obj[key] = overrides;
    } else {
        if (obj[key] instanceof Array) {
            overrideArray(obj, key, overrides, additive);
        } else {
            Object.keys(overrides).forEach(function (innerKey) {
                overrideContextProp(obj[key], innerKey, overrides[innerKey]);
            });
        }
    }
};

module.exports = function (term, opts) {
    
    // FIXME All requests for pages are made via the public search API. This
    // keep us in line with the philosophy that everything is a stream. Maybe
    // that's not a client library decision though?
    opts = opts || {};

    this.emit('ft-api-client:v1:search');

    if (term.indexOf('page:') === 0) {
        var pageName = term.split('page:');
        return this.page(pageName[1], opts);
    }

    var resultContext = setResultContext(opts.resultContext);
    
    if (opts.quantity) {
        resultContext.maxResults = opts.quantity;
    }

    var requestBody = {
        queryString: term,
        queryContext: {
            curations: ["ARTICLES", "BLOGS"]
        },
        resultContext: resultContext
    };

    this.emit('ft-api-client:v1:search:request', term);

    return this.request(endpoint, 'post', JSON.stringify(requestBody))
        .then(function (body) {
            if (body.results.length && !body.results[0].results) {
                this.emit('ft-api-client:v1:complexSearch:response:resolved');
                return {
                    articles:[],
                    meta:{ facets: [], indexCount: 0 }
                };
            }

            var articles = body.results[0].results.map(function (article) {
                return new Article({ item: article }); // make it look like a normal Content API body
            });

            var facets = [];

            if (body.results.length && body.results[0].facets) {
                facets = body.results[0].facets.map(function(facet) {
                    return new Facet(facet);
                });
            }
            
            this.emit('ft-api-client:v1:complexSearch:response:resolved');
            return{
                articles:articles,
                meta:{
                    facets:facets,
                    indexCount: body.results[0].indexCount
                }
            };
        }.bind(this)).catch(function (err) {
            this.config.errorHandler(err);
        }.bind(this));
}





