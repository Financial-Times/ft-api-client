
var expect  = require("chai").expect;
var util    = require("util");
var fs      = require("fs");

var models  = require("../../models");

describe('Article', function(){

    var fixtures = {
        article: JSON.parse(fs.readFileSync('test2/fixtures/03b49444-16c9-11e3-bced-00144feabdc0', { encoding: 'utf8' }))
    }

    it('Convert article links to relative paths', function() {
        var article = new models.Article(fixtures.article);
        expect(article.body).to.contain('href="/5ba75aac-1619-11e3-a57d-00144feabdc0"');
    })
    
    it('Get the largest image associated with the article', function() {
        var article = new models.Article(fixtures.article);
        expect(article.largestImage.url).to.equal('http://im.ft-static.com/content/images/4cec0d2e-8898-4193-8db4-dc0c2ba33df9.img');
    })

})
