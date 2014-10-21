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
        search:  fs.readFileSync('test/fixtures/search-for__climate-change', { encoding: 'utf8' }),
        searchNoResults : fs.readFileSync('test/fixtures/search-no_results', {encoding: 'utf8'}),
        page:    fs.readFileSync('test/fixtures/page_front-page', { encoding: 'utf8' })
    };

    // We probably want to resolve HTTP errors rather than reject them as in the case of fetching
    // several articles in a batch the Promise will fail if it receives a single error. It's probably more
    // tolerant to mask the errors.

    it('Resolve calls that result in API errors as undefined', function(done) {
        var id  = 'abced';
        nock(host).get(util.format(path, id, '123')).reply(503, 'error');
        ft.get(id)
            .then(function (article) {
                expect(article).to.equal(undefined);
                done();
            });
    });

    it('Fulfill the Promise.all even if some of the API call fail', function(done) {
        var ids = ['xxx', 'yyy'];
        nock(host).get(util.format(path, ids[0], '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, ids[1], '123')).reply(503, fixtures.article);
        ft.get(ids)
            .then(function (articles) {
                expect(articles.filter(function (article) {
                    return !!article;
                }).length).to.equal(1);
                done();
            });
    });

    it('Reject api calls that return invalid JSON', function(done) {
        var id = 'abcdefghi';
        nock(host).get(util.format(path, id, '123')).reply(200, '{ "bad" "json" }');
        ft.get(id)
            .then(noop, function (error) {
                expect(error).to.equal('error parsing JSON');
                done();
            });
    });

    describe('Get Article(s)', function(){
        it('Get an article', function(done) {
            nock(host).get(util.format(path, 'abc', '123')).reply(200, fixtures.article);
            ft.get('abc')
                .then(function (article) {
                    expect(article.id).to.equal('03b49444-16c9-11e3-bced-00144feabdc0');
                    done();
                });
        });

        it('Check it was cached for a subsequent resposne', function(done) {
            nock(host).get(util.format(path, 'abc', '123')).reply(200, fixtures.article);
            ft.get('abc')
                .then(function (article) {
                    expect(article.raw.cacheHit).to.equal(true);
                    done();
                });
        });

        it('Get several articles in a single request', function(done) {
            nock(host).get(util.format(path, 'x', '123')).reply(200, fixtures.article);
            nock(host).get(util.format(path, 'y', '123')).reply(200, fixtures.article);
            nock(host).get(util.format(path, 'z', '123')).reply(200, fixtures.article);
            ft.get(['x', 'z', 'y'])
                .then(function (articles) {
                    expect(articles.length).to.equal(3);
                    done();
                });
        });
    });

    describe('Search', function(){
        // FIXME - need tests for no search results, errors, maxResults etc...
        it('Search for articles matching a term', function(done) {
            nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
            ft.search('Climate change')
                .then(function (result) {
                    try{
                        var foo = result.articles.map(function (article) {
                            return article.id;
                        });
                        expect(foo).to.deep.equal([
                            '8aa1e17a-583e-11e4-a31b-00144feab7de',
                            '22d48cfc-57a1-11e4-8493-00144feab7de',
                            'aa7d20c0-547b-11e4-bac2-00144feab7de',
                            'eee0069a-5784-11e4-8493-00144feab7de',
                            'c07a5ada-5621-11e4-bbd6-00144feab7de'
                        ]);
                        done();
                    }catch(e){
                        done(e);
                    }
                }, function (err) { console.log(err); });
        });

        it('Return the specified number of search results', function(done) {
            var spy = sinon.spy(function (body) {
                return '*';
            });
            nock(host).filteringRequestBody(spy).post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
            ft.search("Portillo's teeth removed to boost pound", 99)
                .then(function () {
                    expect(spy.calledOnce).to.true;
                    expect(JSON.parse(spy.firstCall.args[0]).resultContext.maxResults).to.equal(99);
                    done();
                }, function (err) { console.log(err); });
        });

        it('Search for pages (i.e. curated content)', function(done) {
            var path = '/site/v1/pages/4c499f12-4e94-11de-8d4c-00144feabdc0/main-content?apiKey=%s';
            nock(host).get(util.format(path, '123')).reply(200, fixtures.page);
            ft.search('page:Front page')
                .then(function (articles) {
                    var foo = articles.map(function (article) {
                        return article.id;
                    });
                    expect(foo[1]).to.equal('118b635a-4a34-11e4-bc07-00144feab7de');
                    done();
                }, function (err) { console.log(err); });
        });

        it('Should not die when search returns zero results', function(done){
            nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.searchNoResults);
            ft.search('brand:Apple')
                .then(function(response){
                    expect(response.articles.length).to.equal(0);
                    expect(response.meta.facets.length).to.equal(0);
                    done();
                }, done)
        });

        it('Should return a list of facets that appear in the results', function(done){
            var result = JSON.parse(fixtures.search);
            nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
            ft.search('Climate change')
                .then(function (response) {
                    try{
                        expect(response.meta.facets).to.exist;
                        expect(response.meta.facets[0].name).to.equal(result.results[0].facets[0].name);
                        done();
                    }catch(e){
                        done(e);
                    }

                }, done);
        });

        // This test doesn't really test anything
        // We need tests that actually call the API
        it('Should accept an array of facets to pass to the API', function(done){
            var result = JSON.parse(fixtures.search);
            var facets = ["people", "organisations"];
            nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
            ft.search('Climate change', 5, facets)
                .then(function (response) {
                    try{
                        expect(response.meta.facets.length).to.equal(facets.length);
                        expect(response.meta.facets[0].name).to.equal('organisations');
                        expect(response.meta.facets[1].name).to.equal('people');
                        done();
                    }catch(e){
                        done(e);
                    }

                }, done);
        });

        it('Should return the total number of results', function(done){
            var result = JSON.parse(fixtures.search);
            var facets = ["people", "organisations"];
            nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
            ft.search('Climate change', 5, facets)
                .then(function (response) {
                    try{
                       expect(response.meta.counts.total).to.equal(result.results[0].indexCount);
                        done();
                    }catch(e){
                        done(e);
                    }

                }, done);
        });

        it('Should return the total count for each facet', function(done){
            var result = JSON.parse(fixtures.search);
            var facets = ["people", "organisations"];
            nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
            ft.search('Climate change', 5, facets)
                .then(function (response) {
                    try{
                        var total = result.results[0].facets[0].facetElements.reduce(function(count, facet){
                            return count + facet.count;
                        }, 0);
                       expect(response.meta.facets[0].totalCount).to.equal(total);
                        done();
                    }catch(e){
                        done(e);
                    }

                }, done);
        });

        it('Should return the top 5 elements across all facets', function(done){
            var result = JSON.parse(fixtures.search);
            var allFacets = [];

            result.results[0].facets.forEach(function(facet){
                allFacets = allFacets.concat(facet.facetElements);
            });

            allFacets.sort(function(a, b){
                return b.count - a.count;
            });

            nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
            ft.search('Climate change', 5)
                .then(function (response) {
                    debugger;
                    try{
                        expect(response.meta.facetElements).to.deep.equal(allFacets);
                        done();
                    }catch(e){
                        done(e);
                    }
                }, done);
        });

    }); // End of Search Section
});
