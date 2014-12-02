'use strict';

var expect  = require('chai').expect;
var nock    = require('nock');
var sinon   = require('sinon');
var util    = require('util');
var fs      = require('fs');
var request = require('request')

require('es6-promise').polyfill();

var ft      = require('../lib/api')('123');

describe('API', function(){

    var noop = function () { };
    var host = 'http://api.ft.com';
    var path = '/content/items/v1/%s?apiKey=%s&feature.blogposts=on';
    var searchPath = '/content/search/v1?apiKey=%s&feature.blogposts=on';
    var fixtures = {
        article: fs.readFileSync('test/fixtures/03b49444-16c9-11e3-bced-00144feabdc0', { encoding: 'utf8' }),
        search:  fs.readFileSync('test/fixtures/search-for__climate-change', { encoding: 'utf8' }),
        searchNoResults : fs.readFileSync('test/fixtures/search-no_results', {encoding: 'utf8'}),
        page:    fs.readFileSync('test/fixtures/page_front-page', { encoding: 'utf8' })
    };

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

    // FIXME - need tests for no search results, errors, maxResults etc...
    it('Search for articles matching a term', function(done) {
        nock(host).filteringRequestBody(/.*/, '*').post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
        ft.search('Climate change')
          .then(function(result) {
            
            var foo = result.articles.map(function (article) {
                return article.id;
            });
            expect(result.meta.indexCount).to.equal(12233);
            expect(foo).to.deep.equal([ '3031199c-3e8d-11e4-a620-00144feabdc0',
                                        'c48b2eac-3fb9-11e4-a381-00144feabdc0',
                                        '3c34252e-3fd0-11e4-a381-00144feabdc0'  ]);
            done();
        }, function (err) { console.log(err); });
    });
    
    it('Return the specified number of search results', function(done) {
        var spy = sinon.spy(function (body) {
            return '*';
        });
        nock(host).filteringRequestBody(spy).post(util.format(searchPath, '123'), '*').reply(200, fixtures.search);
        ft.search('Portillo\'s teeth removed to boost pound', {
            quantity: 99
        })
          .then(function () {
            expect(spy.calledOnce).to.true;
            expect(JSON.parse(spy.firstCall.args[0]).resultContext.maxResults).to.equal(99);
            done();
        }, function (err) { console.log(err); });
    });

    it('Search for pages (i.e. curated content)', function(done) {
        var path = '/site/v1/pages/4c499f12-4e94-11de-8d4c-00144feabdc0/main-content?apiKey=%s&feature.blogposts=on';
        nock(host).get(util.format(path, '123')).reply(200, fixtures.page);
        ft.search('page:Front page')
          .then(function (results) {
            var articles = results.articles;
            var foo = articles.map(function (article) {
                return article.id;
            });
            expect(foo[1]).to.equal('118b635a-4a34-11e4-bc07-00144feab7de');
            done();
        }, function (err) { console.log(err); });
    });
    


    it('Always reject requests for single articles that result in API errors', function(done) {
        var id  = 'abced';
        var spy = sinon.spy();
        nock(host).get(util.format(path, id, '123')).reply(503, '{"message":"error"}');
        ft.get(id)
          .catch(spy)
          .then(function () {
            done();
            expect(spy.calledOnce).to.be.true;
          });
    });
    
    it('Fulfill the Promise.all even if some of the API call fail', function(done) {
        var ids = ['xxx', 'yyy'];
        nock(host).get(util.format(path, ids[0], '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, ids[1], '123')).reply(503, '{"message":"error"}');
        ft.get(ids)
          .then(function (articles) {
            expect(articles.filter(function (article) {
                return !!article;
            }).length).to.equal(1);
            done();
        });
    });

    it('Configure to reject the Promise.all if some of the API call fail', function(done) {
        var spy = sinon.spy();
        var ids = ['aaa', 'bbb'];
        nock(host).get(util.format(path, ids[0], '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, ids[1], '123')).reply(503, '{"message":"error"}');
        ft.get(ids, {strict: true})
          .catch(spy)
          .then(function () {
            expect(spy.calledOnce).to.be.true;
            done();
          });
    });

    it('Reject the Promise.all if all of the API calls fail', function(done) {
        var ids = ['sss', 'ttt'];
        var spy = sinon.spy();
        nock(host).get(util.format(path, ids[0], '123')).reply(503, '{"message":"error"}');
        nock(host).get(util.format(path, ids[1], '123')).reply(503, '{"message":"error"}');
        ft.get(ids)
          .catch(spy)
          .then(function () {
            expect(spy.calledOnce).to.be.true;
            done();
          });
    });
    
    it('Expose/define the http status code in any errors', function(done) {
        var id = 'abcdefghi';
        nock(host).get(util.format(path, id, '123')).reply(403, '{ "message": "calamity!" }');
        ft.get(id)
          .catch(function (err) {
            expect(err.statusCode).to.equal(403);
            expect('' + err).to.match(/403 .* calamity\!/);
            done();
          });
    });

    it('Reject api calls that return invalid JSON', function(done) {
        var id = 'jklmnop';
        var spy = sinon.spy();
        nock(host).get(util.format(path, id, '123')).reply(200, '{ "bad" "json" }');
        ft.get(id)
          .catch(spy)
          .then(function () {
            expect(spy.calledOnce).to.be.true;
            done();
          });
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
                } catch(e){
                    done(e);
                }

            }, done);
    });


    it('Should be possible to configure timeout', function () {
        var ft = require('../lib/api')('123', {timeout: 3000});
        sinon.stub(request, 'post');
        sinon.stub(request, 'get');
        
        ft.search('Climate change');
        ft.get([123]);
        console.log(JSON.stringify(request.post.lastCall.args[0], null, '\t'));
        expect(request.post.lastCall.args[0].timeout).to.equal(3000);
        expect(request.get.lastCall.args[0].timeout).to.equal(3000);

        request.get.restore();
        request.post.restore();
    });


    it('Search should request different fields if user specifies', function () {
        sinon.stub(request, 'post');
        ft.search('Climate change', {
            quantity: 20,
            resultContext: {
                offset: 10,
                highlight: true,
                aspects: ['testterm1','testterm2'],
                facets: {
                    '+names': ['testterm3']
                }
            }
        });
        var resultContext = JSON.parse(request.post.lastCall.args[0].body).resultContext;
        

        expect(resultContext.aspects).to.eql([
            "testterm1",
            "testterm2"
        ]);
        expect(resultContext.maxResults).to.equal(20);
        expect(resultContext.offset).to.equal(10);
        expect(resultContext.highlight).to.be.true;
        expect(resultContext.facets.names).to.eql([
            "organisations",
            "regions",
            "sections",
            "topics",
            "testterm3"
        ]);

        request.post.restore();
    });


});
