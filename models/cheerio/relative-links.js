
var cheerio = require('cheerio');
var url     = require('url');

// Fix any old ft links, Eg. 
//  www.ft.com/cms/s/43515588-00fc-11e4-a938-00144feab7de.html -> /43515588-00fc-11e4-a938-00144feab7de 

module.exports = function (html) {
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
};
