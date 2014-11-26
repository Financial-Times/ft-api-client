'use strict';
var v1      = require('./');

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

module.exports = function (term, quantity, overrides) {
    
    // FIXME All requests for pages are made via the public search API. This
    // keep us in line with the philosophy that everything is a stream. Maybe
    // that's not a client library decision though?

    if (term.indexOf('page:') === 0) {
        var pageName = term.split('page:');
        return v1.page.apply(this, [pageName[1], quantity]);
    }

    var resultContext = setResultContext(overrides);
    
    if (quantity) {
        resultContext.maxResults = quantity;
    }

    var self = this;
   
    var searchBodyTemplate = {
        queryString: term,
        queryContext: {
            curations: ["ARTICLES", "BLOGS"]
        },
        resultContext: resultContext
    };

    return v1.complexSearch.call(self, searchBodyTemplate);

};
