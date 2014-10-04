'use strict';
var expect  = require("chai").expect;
var fs      = require("fs");
var cheerio = require("cheerio");

var models  = require("../../models");

describe('Page model', function(){

    it('Find the API resource given a page title', function() {
        expect(models.Pages.findByTitle('Front page').apiUrl).to.contain('pages/4c499f12-4e94-11de-8d4c-00144feabdc0');
    });
    
    it('Fail to find a non-existant resource', function() {
        expect(!!models.Pages.findByTitle('Not here')).to.be.false;
    });

});
