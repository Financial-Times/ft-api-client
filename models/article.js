
var cheerio = require('cheerio')
var url     = require('url')

function Article (obj) {
    obj && this.parse(obj);
}

/**
 * Hydrates the model from a raw API response
 */
Article.prototype.parse = function (obj) {
    this.id = obj.item.id;
    this.raw = obj;
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
}

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

        var $ = cheerio.load(this.raw.item.body.body);
        // Fix any old ft links, Eg. 
        //  www.ft.com/cms/s/43515588-00fc-11e4-a938-00144feab7de.html -> /43515588-00fc-11e4-a938-00144feab7de 
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
