'use strict';

var model   = require('../../models');

module.exports = {
    search: function (body) {
        // was a valid request, but had no results so don't reject just resolve with empty array
        if (body.results.length && !body.results[0].results) {
            return {
                articles:[],
                meta:{ facets: [], indexCount: 0 }
            };
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
        
        
        return {
            articles:articles,
            meta:{
                facets:facets,
                indexCount: body.results[0].indexCount
            }
        };
    }
};