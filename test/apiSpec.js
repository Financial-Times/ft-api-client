'use strict';

var expect  = require("chai").expect;
var nock    = require("nock");
var sinon   = require("sinon");
var util    = require("util");
var fs      = require("fs");

require('es6-promise').polyfill();

var ft      = require("../lib/api")('123');

describe('API', function(){

    var noop = function () { };
    var host = 'http://api.ft.com';
    var path = '/content/items/v1/%s?apiKey=%s';
    var searchPath = '/content/search/v1?apiKey=%s';
    var fixtures = {
        article: fs.readFileSync('test/fixtures/03b49444-16c9-11e3-bced-00144feabdc0', { encoding: 'utf8' }),
        search:  fs.readFileSync('test/fixtures/search-for__climate-change', { encoding: 'utf8' })
    };

    it('Get an article', function(done) {
        nock(host).get(util.format(path, 'abc', '123')).reply(200, fixtures.article);
        ft.items('abc')
          .then(function (article) {
            expect(article.id).to.equal('03b49444-16c9-11e3-bced-00144feabdc0');
            done();
        });
    });
    
    it('Get several articles in a single request', function(done) {
        nock(host).get(util.format(path, 'x', '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, 'y', '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, 'z', '123')).reply(200, fixtures.article);
        ft.items(['x', 'z', 'y'])
          .then(function (articles) {
            expect(articles.length).to.equal(3);
            done();
        });
    });

    // FIXME - need tests for no search results, errors, maxResults etc...
    it('Search for articles matching a term', function(done) {

        nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
        
        ft.search('Climate change')
          .then(function (articles) {
            var foo = articles.map(function (article) {
                return article.id;
            });
            expect(foo).to.deep.equal([ '3031199c-3e8d-11e4-a620-00144feabdc0',
                                   'c48b2eac-3fb9-11e4-a381-00144feabdc0',
                                   '3c34252e-3fd0-11e4-a381-00144feabdc0' ]);
            done();
        }, function (err) { console.log(err); });
    });
    
    it('Return the specified number of search results', function(done) {

        var spy = sinon.spy(function (body) {
            return '*';
        })

        nock(host).filteringRequestBody(spy).post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
        
        ft.search("Portillo's teeth removed to boost pound", 99)
          .then(function (articles) {
            expect(spy.calledOnce).to.true;
            expect(JSON.parse(spy.firstCall.args[0]).resultContext.maxResults).to.equal(99);
            done();
        }, function (err) { console.log(err); });
    });

    
    // We probably want to resolve HTTP errors rather than reject them as in the case of fetching 
    // several articles in a batch the Promise will fail if it receives a single error. It's probably more 
    // tolerant to mask the errors.

    it('Resolve calls that result in API errors as undefined', function(done) {
        nock(host).get(util.format(path, 'abc', '123')).reply(503, 'error');
        ft.items('abc')
          .then(function (article) {
            expect(article).to.equal(undefined);
            done();
        });
    });

    it('Fulfill the Promise.all even if some of the API call fail', function(done) {
        nock(host).get(util.format(path, 'x', '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, 'y', '123')).reply(503, fixtures.article);
        ft.items(['x', 'y'])
          .then(function (articles) {
            expect(articles.filter(function (article) {
                return !!article; 
            }).length).to.equal(1);
            done();
        });
    });
    
    it('Reject api calls that return invalid JSON', function(done) {
        nock(host).get(util.format(path, 'abc', '123')).reply(200, '{ "bad" "json" }');
        ft.items('abc')
          .then(noop, function (error) {
            expect(error).to.equal('error parsing JSON');
            done();
        });
    });

});
