var cheerio = require('cheerio');
var url     = require('url');
var capiLinkRX = /\/([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)/;

var isContentApiLink = function (url) {
    return capiLinkRX.test(url);
};

module.exports = {
    /**
     * Returns a list of internal ft.com links from a given HTML string
     */
    findInboundLinks: function (html) { // rename to capiLinks
        var $ = cheerio.load(html);
        return $('a').filter(function(i, el) {
            console.log($(this).attr('href'), capiLinkRX.test($(this).attr('href')))
            return isContentApiLink($(this).attr('href')); 
        }).map(function(i, el) {
            return $(this).attr('href');
        }).get();
    },
    /**
     * Returns a list of non-ft.com links from a given HTML string
     */
    findOutboundLinks: function (html) {
        var $ = cheerio.load(html);
        return $('a').filter(function(i, el) {
            var isFtLink = !/\.ft\.com/.test($(this).attr('href'));
            return isFtLink; 
        }).map(function(i, el) {
            return $(this).attr('href');
        }).get();
    },
    // Fix any old ft links, Eg.
    //  www.ft.com/cms/s/43515588-00fc-11e4-a938-00144feab7de.html -> /43515588-00fc-11e4-a938-00144feab7de
    fixRelativeLinks: function (html) {
        var $ = cheerio.load(html);
        $('a[href]').attr('href', function (index, value) {
            var path = url.parse(value).pathname;
            var re = /\/([^\/]+)\.html$/.exec(path);
            if (re) {
                return '/' + re[1];
            }
            return value;
        });
        return $.html();
    },

    /**
     * Removes paragraphs elements containing only whitespace nodes
     * @return String
     */
    removeEmptyParagraphs: function(html) {
        return html.replace(/<p>\s+<\/p>/, '');
    },
    // Strips any links from the HTML that aren't Content API articles
    removeNonArticleLinks: function (html) {
        var $ = cheerio.load(html);
        $('a').replaceWith(function (index, el) {
            var clone;
            if (isContentApiLink($(el).attr('href'))) {
                clone = $(el).clone();

                // TODO: We shouldn't remove these title attributes but right now these affect the word count
                // so taking the expedient option.
                clone.removeAttr('title');
                return clone;

            } else {
                return el.children;
            }

        });
        return $.html();
    }
};