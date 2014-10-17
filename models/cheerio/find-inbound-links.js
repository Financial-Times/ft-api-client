
var cheerio = require('cheerio');
var url     = require('url');

/**
 * Returns a list of internal ft.com links from a given HTML string
 */
module.exports = function (html) {
    var $ = cheerio.load(html);
    return $('a').filter(function(i, el) {
        var isContentApiLink = /([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)/.test($(this).attr('href'));
        return isContentApiLink; 
    }).map(function(i, el) {
        return $(this).attr('href');
    }).get()
};
