
var expect  = require("chai").expect;
var nock    = require("nock");
var util    = require("util");
var fs      = require("fs");

GLOBAL.Promise = require('es6-promise').Promise;

var ft      = require("../lib/api")('123');

describe('API', function(){
 
    var noop = function () { };
    var host = 'http://api.ft.com';
    var path = '/content/items/v1/%s?apiKey=%s';

    var fixtures = {
        article: fs.readFileSync('test/fixtures/03b49444-16c9-11e3-bced-00144feabdc0', { encoding: 'utf8' })
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

    // We probably want to resolve HTTP errors rather than reject them as in the case of fetching 
    // several articles in a batch the Promise will fail if it receives a single error. It's probably more 
    // tolerant to mask the errors.

    it('Resolve calls that result in API errors as undefined', function(done) {
        nock(host).get(util.format(path, 'abc', '123')).reply(503, 'error');
        ft.get('abc')
          .then(function (article) {
            expect(article).to.equal(undefined);
            done();
        })
    })

    it('Fulfill the Promise.all even if some of the API call fail', function(done) {
        nock(host).get(util.format(path, 'x', '123')).reply(200, fixtures.article);
        nock(host).get(util.format(path, 'y', '123')).reply(503, fixtures.article);
        ft.get(['x', 'y'])
          .then(function (articles) {
            expect(articles.filter(function (article) {
                return !!article; 
            }).length).to.equal(1);
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
