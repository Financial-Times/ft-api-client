'use strict';

var expect  = require("chai").expect;
var fs      = require("fs");
var cheerio = require("cheerio");

var models  = require("../../models");

describe('Article model', function(){

    var fixtures = {
        article: JSON.parse(fs.readFileSync('test/fixtures/03b49444-16c9-11e3-bced-00144feabdc0', { encoding: 'utf8' })),
        brandedArticle: JSON.parse(fs.readFileSync('test/fixtures/3822867f-85bf-33a2-85a5-4a40974d7d9e', { encoding: 'utf8' }))
    };

    describe('Editorial', function () {

        it('Convert article links to relative paths', function() {
            var article = new models.Article(fixtures.article);
            expect(article.body).not.to.contain('href="http://"');
        });
    
        // This is specifically for Next. We don't support all types of content from day 1.
        it('Remove links that are not Content API articles from the body', function() {
            var article = new models.Article(fixtures.article);
            var $ = cheerio.load(article.body);
            expect($('a').length).to.equal(2);
        });
    
        it('Calculate the article word count and estimated reading time', function() {
            var article = new models.Article(fixtures.article);
            expect(article.wordCount).to.equal(775);
            expect(article.readingTime).to.equal(3); // in minutes
        });

        it('Get the headline', function() {
            var article = new models.Article(fixtures.article);
            expect(article.headline).to.equal('Obama steadfast on Syria strikes despite G20 opposition');
        });

    });

    describe('Metadata', function () {
        
        it('Get the published and updated dates', function() {
            var article = new models.Article(fixtures.article);
            expect(article.firstPublished.toUTCString()).to.equal('Fri, 06 Sep 2013 09:12:45 GMT');
            expect(article.lastUpdated.toUTCString()).to.equal('Fri, 06 Sep 2013 16:16:04 GMT');
        });
    
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
        
        it('Get a list of regions the article mentions', function() {
            var article = new models.Article(fixtures.article);
            var regions = article.regions.map(function (region) {
                return region.name;
            }).join(", ");
            expect(regions).to.equal("United Kingdom, Russia, Syria, United States of America");
            expect(article.regions[0].searchString).to.equal('regions:"United Kingdom"');
        });
        
        // TODO - not sure if we want to use sections in v3 as it re-enforces
        // the view that the world is seen through our editorial structure.
        
        xit('Get a list of the sections an article is classfied under', function() { });
        
        it('Get a subjects the article is about', function() {
            var article = new models.Article(fixtures.article);
            var subjects = article.subjects.map(function (subject) {
                return subject.name;
            }).join(", ");
            expect(subjects).to.equal("Summits & Talks, National Security, Politics, General News, Human Resources & Employment, Industrial Relations & Unions");
            expect(article.subjects[0].searchString).to.equal('subjects:"Summits & Talks"');
        
        });
        
        it('Get a list of topics the article refers to', function() {
            var article = new models.Article(fixtures.article);
            var topics = article.topics.map(function (topic) {
                return topic.name;
            }).join(", ");
            expect(topics).to.equal("Syria crisis");
            expect(article.topics[0].searchString).to.equal('topics:"Syria crisis"');
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
       
        it('Get the genre of the article', function() {
            var article = new models.Article(fixtures.article);
            expect(article.genre).to.equal('News');
        });
        
        it('Get the (visual) tone of the article', function() {
            var article = new models.Article(fixtures.article);
            expect(article.visualTone).to.equal('news');
        });

        it('Get the brand of the article', function() {
            var article = new models.Article(fixtures.brandedArticle);
            expect(article.brand.name).to.equal('Gavyn Davies');
        });
        
    });

    describe('Assets', function () {

        it("Indicates if the article contains video", function () {
            var article = new models.Article(fixtures.article);
            expect(article.has_video).to.be.true;
        });
        
        it("Get the associated videos", function () {
            var article = new models.Article(fixtures.article);
            expect(article.videos[0].fields.sourceReference).to.equal('3794473930001');
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

        // Factors the effect prominence
        it("List inbound links", function () {
            var article = new models.Article(fixtures.article);
            expect(article.inboundLinks[0]).to.equal('http://www.ft.com/cms/s/0/654f3846-149c-11e3-b3db-00144feabdc0.html');
        });

        it("List outbound links", function () {
            var article = new models.Article(fixtures.article);
            expect(article.outboundLinks[1]).to.equal('http://www.bbc.co.uk/news/uk-29662245');
        });

        xit("Denote sharecount", function () { });

    });

    describe('Paragraphs', function () {
        
        it("Provides an option to remove images from paragraphs", function () {
            var article = new models.Article(fixtures.article);
            expect(!!article.paragraphs(0, 1, { removeImages: false }).html().match(/<img[^>]*>/)).to.be.true;
            expect(!!article.paragraphs(0, 1).html().match(/<img[^>]*>/)).to.be.false;
        });
        
        it('Get a specified number of paragraphs from the article body', function() {
            var article = new models.Article(fixtures.article);
            var p = article.paragraphs(0, 4);
            expect(p.length).to.equal(4);
            expect(p.text()).to.match(/(.*)principle\.”$/);
        });

    });

});
