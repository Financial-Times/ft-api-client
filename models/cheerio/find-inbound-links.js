
var cheerio = require('cheerio');
var url     = require('url');

// Fix any old ft links, Eg. 
//  www.ft.com/cms/s/43515588-00fc-11e4-a938-00144feab7de.html -> /43515588-00fc-11e4-a938-00144feab7de 

module.exports = function (html) {
    var $ = cheerio.load(html);
    return $('a').filter(function(i, el) {
        var isContentApiLink = /([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)/.test($(this).attr('href'));
        return isContentApiLink; 
    }).map(function(i, el) {
        return $(this).attr('href');
    }).get()
};
