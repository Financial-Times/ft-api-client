
var cheerio = require('cheerio');
var util    = require('util');

// Strips any links from the HTML that aren't Content API articles
module.exports = function (html) {
    var $ = cheerio.load(html);
    $('a').replaceWith(function (index, el) {
        var isContentApiLink = /^\/([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)$/.test(el.attribs.href);
        if (isContentApiLink) {
            return el;
        } else {
            return el.children;
        }

    });
    return $.html();
};
