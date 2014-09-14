
var expect  = require("chai").expect;
var nock    = require("nock");
var util    = require("util");
var fs      = require("fs");

GLOBAL.Promise = require('es6-promise').Promise;

var ft      = require("../lib2/api")('123');

describe('API', function(){
 
    var noop = function () { };
    var host = 'http://api.ft.com';
    var path = '/content/items/v1/%s?apiKey=%s';

    var fixtures = {
        article: fs.readFileSync('test2/fixtures/03b49444-16c9-11e3-bced-00144feabdc0', { encoding: 'utf8' })
    }

    it('Get an article', function(done) {
        nock(host).get(util.format(path, 'abc', '123')).reply(200, fixtures.article);
        ft.get('abc')
          .then(function (article) {
            expect(article.id).to.equal('03b49444-16c9-11e3-bced-00144feabdc0');
            done();
        })
    })
    
    it('Get several articles in a single request', function(done) {
        nock(host).get(util.format(path, 'x', '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, 'y', '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, 'z', '123')).reply(200, fixtures.article);
        ft.get(['x', 'z', 'y'])
          .then(function (articles) {
            expect(articles.length).to.equal(3);
            done();
        })
    })
   
    //site/v1/pages/bd1f7f78-d3f0-11e2-8639-00144feab7de/main-content

    it('Reject api calls that result in API errors', function(done) {
        nock(host).get(util.format(path, 'abc', '123')).reply(503, 'error');
        ft.get('abc')
          .then(noop, function (error) {
            expect(error.statusCode).to.equal(503);
            done();
        })
    })
    
    it('Reject api calls that return invalid JSON', function(done) {
        nock(host).get(util.format(path, 'abc', '123')).reply(200, '{ "bad" "json" }');
        ft.get('abc')
          .then(noop, function (error) {
            expect(error).to.equal('error parsing JSON');
            done();
        })
    })

})
