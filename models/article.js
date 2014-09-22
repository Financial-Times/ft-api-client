
var cheerio = require('cheerio')
var url     = require('url')
var util    = require('util')

function Article (obj) {
    obj && obj.item && this.parse(obj);
}

/**
 * Hydrates the model from a raw API response
 */
Article.prototype.parse = function (obj) {
    
    this.id = obj.item.id;
    this.raw = obj;

    var readingSpeed = 300; // wpm

    if (!this.raw.item.body) return;

    // FIXME - move to defineProperty getters
    this.wordCount = this.body.split(' ').length;
    this.readingTime = Math.round(this.wordCount / readingSpeed);
}

/**
 * Returns a given range of paragraphs from the article body
 */
Article.prototype.paragraphs = function (to, from) {
    var $ = cheerio.load(this.body);
    return $('p').slice(to, from);
}

/**
 * Returns a list of package id's
 */
Article.prototype.packages = function (to, from) {
    this.raw.item.package.map(function (pkg) {
        return pkg.id;
    })
};

/**
 * Returns a list of authors 
 */
Object.defineProperty(Article.prototype, 'authors', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.authors) { 
            return this.raw.item.metadata.authors.map(function (author) {
                author.term.searchString = 'author:"' + author.term.name + '"';
                return author.term;
            })
        }
        return [];
    }
});

/**
 * Returns a list of people 
 */
Object.defineProperty(Article.prototype, 'people', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.people) { 
            return this.raw.item.metadata.people.map(function (person) {
                person.term.searchString = 'people:"' + person.term.name + '"';
                return person.term;
            })
        }
        return [];
    }
});

/**
 * Returns a list of organisations 
 */
Object.defineProperty(Article.prototype, 'organisations', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.organisations) {
            return this.raw.item.metadata.organisations.map(function (org) {
                org.term.searchString = 'organisations:"' + org.term.name + '"';
                return org.term;
            })
        }
        return [];
    }
});

/**
 * Returns a the genre. For simplicity articles only have one genre. 
 */
Object.defineProperty(Article.prototype, 'genre', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.genre) { 
            return this.raw.item.metadata.genre[0].term.name
        }
        return undefined;
    }
});

/**
 * Returns a the primary section object 
 */
Object.defineProperty(Article.prototype, 'primarySection', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.primarySection) { 
            return this.raw.item.metadata.primarySection.term
        }
        return [];
    }
});

/**
 * Returns a the primary theme object 
 */
Object.defineProperty(Article.prototype, 'primaryTheme', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.primaryTheme) { 
            return this.raw.item.metadata.primaryTheme.term
        }
        return [];
    }
});

/**
 * The resource's published date as a JavaScript Date object.
 */
Object.defineProperty(Article.prototype, 'firstPublished', {
    get: function () {
        return new Date(this.raw.item.lifecycle.initialPublishDateTime);
    }
});

/*
 * The resource's last updated date as a JavaScript Date object.
 */
Object.defineProperty(Article.prototype, 'lastUpdated', {
    get: function () {
        return new Date(this.raw.item.lifecycle.lastPublishDateTime);
    }
});

/**
 * The article body as HTML.
 */
Object.defineProperty(Article.prototype, 'body', {
    get: function () {
        
        // Fix any old ft links, Eg. 
        //  www.ft.com/cms/s/43515588-00fc-11e4-a938-00144feab7de.html -> /43515588-00fc-11e4-a938-00144feab7de 
        var relativeLinks = function (html) {
            var $ = cheerio.load(html);
            $('a').attr('href', function (index, value) {
                var path = url.parse(value).pathname;
                var re = /\/([^\/]+)\.html$/.exec(path);
                if (re) {
                    return '/' + re[1]; 
                }
                return value;
            });
            return $.html();
        }
       
        // Strips any links from the HTML that aren't Content API articles 
        var removeNonArticleLinks = function (html) {
            var $ = cheerio.load(html);
            $('a').replaceWith(function (index, el) {
                var isContentApiLink = /^\/([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)$/.test(el.attribs.href);
                var textContent = (el.children.length > 0) ? el.children[0].data : '';
                if (isContentApiLink) {
                    return util.format('<a href="%s">%s</a>', el.attribs.href, textContent);
                } else {
                    return textContent; 
                }

            })
            return $.html();
        }
      
        var html = this.raw.item.body.body;
        
        return removeNonArticleLinks(
                relativeLinks(
                    html
                )
        );


    }
});

/**
 * The largest image (ie. in pixels) that is associated with the resource
 */
Object.defineProperty(Article.prototype, 'largestImage', {
    get: function () {
        if (this.raw.item.images) {
            var sortedImages = this.raw.item.images.sort(function (a, b) {
                return a.width < b.width
            });
            return sortedImages[0];
        }
    }
})

module.exports = Article;
