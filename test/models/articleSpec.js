
var expect  = require("chai").expect;
var util    = require("util");
var fs      = require("fs");
var cheerio = require("cheerio");

var models  = require("../../models");

describe('Article model', function(){

    var fixtures = {
        article: JSON.parse(fs.readFileSync('test/fixtures/03b49444-16c9-11e3-bced-00144feabdc0', { encoding: 'utf8' }))
    }

    it('Convert article links to relative paths', function() {
        var article = new models.Article(fixtures.article);
        expect(article.body).to.contain('href="/5ba75aac-1619-11e3-a57d-00144feabdc0"');
    })
    
    it('Remove links that are not Content API articles from the body', function() {
        var article = new models.Article(fixtures.article);
        $ = cheerio.load(article.body);
        expect($('a').length).to.equal(3);
    })
    
    it('Get the largest image associated with the article', function() {
        var article = new models.Article(fixtures.article);
        expect(article.largestImage.url).to.equal('http://im.ft-static.com/content/images/4cec0d2e-8898-4193-8db4-dc0c2ba33df9.img');
    })
    
    it('Get a specified number of paragraphs from the article body', function() {
        var article = new models.Article(fixtures.article);
        var p = article.paragraphs(0, 4)
        expect(p.length).to.equal(4);
        expect(p.text()).to.match(/(.*)principle\.”$/);
    })
    
    it('Get the published and updated dates', function() {
        var article = new models.Article(fixtures.article);
        expect(article.firstPublished.toString()).to.equal('Fri Sep 06 2013 10:12:45 GMT+0100 (BST)');
        expect(article.lastUpdated.toString()).to.equal('Fri Sep 06 2013 17:16:04 GMT+0100 (BST)');
    })
   
    // FIXME 
    xit('Get the published and updated dates as relative time', function() { });
    
    it('Get the article word count and estimated reading time', function() {
        var article = new models.Article(fixtures.article);
        expect(article.wordCount).to.equal(766);
        expect(article.readingTime).to.equal(3); // in minutes
    })
    
    it('Get a list of authors', function() {
        var article = new models.Article(fixtures.article);
        var authors = article.authors.map(function (author) {
            author.searchString = 'author:"' + author.name + '"';
            return author.name;
        }).join(", ")
        expect(authors).to.equal("Charles Clover, Courtney Weaver, George Parker")
    });
    
    it('Get the primary section', function() {
        var article = new models.Article(fixtures.article);
        expect(article.primarySection.name).to.equal('Middle Eastern Politics & Society');
    });

    xit('Get the tags', function() {});


})
