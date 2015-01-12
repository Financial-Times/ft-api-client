'use strict';
var expect  = require("chai").expect;
var fs      = require("fs");
var cheerio = require("cheerio");
var pagesModel  = require("../../lib/models/pages");
var sinon = require('sinon');
var pagesJob = require('../../lib/jobs/pages');

describe('Page model', function(){

    beforeEach(function () {
        sinon.stub(pagesJob, 'get', function () {
            return JSON.parse(fs.readFileSync('./test/fixtures/pages')).pages;
        });
    });
    
    afterEach(function () {
        pagesJob.get.restore();
    });

    it('Find the API resource given a page title', function () {
        expect(pagesModel.findByTitle('Front page').apiUrl).to.contain('pages/4c499f12-4e94-11de-8d4c-00144feabdc0');
    });
    
    it('Fail to find a non-existant resource', function () {
        expect(!!pagesModel.findByTitle('Not here')).to.be.false;
    });

});
