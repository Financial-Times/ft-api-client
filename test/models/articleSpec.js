'use strict';
var expect  = require("chai").expect;
var fs      = require("fs");
var cheerio = require("cheerio");

var models  = require("../../models");

describe('Article model', function(){

    var fixtures = {
        article: JSON.parse(fs.readFileSync('test/fixtures/03b49444-16c9-11e3-bced-00144feabdc0', { encoding: 'utf8' }))
    };

    describe('Body', function () {

        it('Convert article links to relative paths', function() {
            var article = new models.Article(fixtures.article);
            expect(article.body).to.contain('href="/5ba75aac-1619-11e3-a57d-00144feabdc0"');
        });
    
        // This is specifically for Next. We don't support all types of content from day 1.
        it('Remove links that are not Content API articles from the body', function() {
            var article = new models.Article(fixtures.article);
            var $ = cheerio.load(article.body);
            expect($('a').length).to.equal(3);
        });
    
        it('Get a specified number of paragraphs from the article body', function() {
            var article = new models.Article(fixtures.article);
            var p = article.paragraphs(0, 4);
            expect(p.length).to.equal(4);
            expect(p.text()).to.match(/(.*)principle\.”$/);
        });
    
        it('Calculate the article word count and estimated reading time', function() {
            var article = new models.Article(fixtures.article);
            expect(article.wordCount).to.equal(766);
            expect(article.readingTime).to.equal(3); // in minutes
        });
        
    });

    describe('Metadata', function () {
        
        it('Get the published and updated dates', function() {
            var article = new models.Article(fixtures.article);
            expect(article.firstPublished.toString()).to.match(/^Fri Sep 06 2013 10:12:45 GMT+/);
            expect(article.lastUpdated.toString()).to.match(/^Fri Sep 06 2013 17:16:04 GMT+/);
        });
    
        // FIXME 
        xit('Get the published and updated dates as relative time', function() { });
    
    
        it('Get a list of article authors (i.e. byline)', function() {
            var article = new models.Article(fixtures.article);
            var authors = article.authors.map(function (author) {
                return author.name;
            }).join(", ");
            expect(authors).to.equal("Charles Clover, Courtney Weaver, George Parker");
            expect(article.authors[0].searchString).to.equal('authors:"Charles Clover"');
        });

        it('Get a list of associated people', function() {
            var article = new models.Article(fixtures.article);
            var people = article.people.map(function (people) {
                return people.name;
            }).join(", ");
            expect(people).to.equal("Vladimir Putin, Barack Obama, David Cameron (politician)");
            expect(article.people[0].searchString).to.equal('people:"Vladimir Putin"');
        });
        
        it('Get a list of organisations mentioned', function() {
            var article = new models.Article(fixtures.article);
            var org = article.organisations.map(function (org) {
                return org.name;
            }).join(", ");
            expect(org).to.equal("Group of Twenty");
            expect(article.organisations[0].searchString).to.equal('organisations:"Group of Twenty"');
        });
        
        it('Get a list of organisations stock market symbols', function() {
            var article = new models.Article(fixtures.article);
            expect(article.tickerSymbols).to.deep.equal([
                    { "code": "uk:SBRY", "name": "J Sainsbury PLC" },
                    { "code": "uk:TSCO", "name": "Tesco PLC" }
            ]);
        });
    
        it('Get the primary section', function() {
            var article = new models.Article(fixtures.article);
            expect(article.primarySection.name).to.equal('Middle Eastern Politics & Society');
            // TODO expect(article.organisations[0].searchString).to.equal('organisations:"Group of Twenty"')
        });
        
        it('Get the primary theme', function() {
            var article = new models.Article(fixtures.article);
            expect(article.primaryTheme.name).to.equal('Scottish Independence');
            // TODO expect(article.organisations[0].searchString).to.equal('organisations:"Group of Twenty"')
        });
       
        // Sets the visual tone of the article
        it('Get the genre of the article', function() {
            var article = new models.Article(fixtures.article);
            expect(article.genre).to.equal('News');
        });
    
    });

    describe('Assets', function () {

        it("Indicates if the article contains video", function () {
            var article = new models.Article(fixtures.article);
            expect(article.has_video).to.be.true;
        });
        
        it("List the packages", function () {
            var article = new models.Article(fixtures.article);
            expect(article.packages[2]).to.equal('ecfea614-1712-11e3-9ec2-00144feabdc0');
        });
        
        // TODO - Is there a difference between a gallery and a slideshow? 
        it("Indicates if the article contains a gallery or slideshow", function () {
            var article = new models.Article(fixtures.article);
            expect(article.has_gallery).to.be.true;
        });
        
        it("Get associated pull quotes", function () {
            var article = new models.Article(fixtures.article);
            expect(article.quotes[0].fields.body).to.contain('One of the biggest concerns');
        });
    
        it('Get the largest image associated with the article', function() {
            var article = new models.Article(fixtures.article);
            expect(article.largestImage.url).to.equal('http://im.ft-static.com/content/images/4cec0d2e-8898-4193-8db4-dc0c2ba33df9.img');
        });
        
        // TODO audio etc. 
        xit("Indicates if the aricle contains audio", function () { });
        xit('Extract the video from the article, Eg, article.videos', function() {});

    });

    // people, orgs, regions/places
});
