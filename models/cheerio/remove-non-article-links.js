
var cheerio = require('cheerio');
var util    = require('util');

// Strips any links from the HTML that aren't Content API articles 
module.exports = function (html) {
    var $ = cheerio.load(html);
    $('a').replaceWith(function (index, el) {
        var isContentApiLink = /^\/([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)$/.test(el.attribs.href);
        var textContent = (el.children.length > 0) ? el.children[0].data : '';
        if (isContentApiLink) {
            return util.format('<a href="%s">%s</a>', el.attribs.href, textContent);
        } else {
            return textContent; 
        }

    });
    return $.html();
};
