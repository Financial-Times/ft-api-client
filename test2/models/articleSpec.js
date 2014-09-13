
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

})
