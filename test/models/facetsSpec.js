'use strict';

var expect  = require("chai").expect;
var fs      = require("fs");
var path    = require('path')
var cheerio = require("cheerio");

var models  = require("../../models");

describe('Facets model', function(){
   var fixtureFilePath = path.resolve('test/fixtures/search-for__climate-change');
    var fixture = JSON.parse(fs.readFileSync(fixtureFilePath, {encoding:'utf8'}));
    var FacetsModel = models.Facets;

    it('Can correctly parse the facets out of a search result', function(){
        var data = fixture.results[0].facets;
        var models = data.map(function(d){
            return new FacetsModel(d);
        });

        expect(models[0].name).to.equal(data[0].name);
        expect(models[0].elements[0].name).to.equal(fixture.results[0].facets[0].facetElements[0].name);
        expect(models[0].elements[0].count).to.equal(fixture.results[0].facets[0].facetElements[0].count);
    });
});
