
var cheerio = require('cheerio');
var url     = require('url');

/**
 * Returns a list of non-ft.com links from a given HTML string
 */
module.exports = function (html) {
    var $ = cheerio.load(html);
    return $('a').filter(function(i, el) {
        var isFtLink = !/\.ft\.com/.test($(this).attr('href'));
        return isFtLink; 
    }).map(function(i, el) {
        return $(this).attr('href');
    }).get()
};
