
var cheerio = require('cheerio');
var util    = require('util');

// Strips any links from the HTML that aren't Content API articles
module.exports = function (html) {
    var $ = cheerio.load(html);
    $('a').replaceWith(function (index, el) {
        var isContentApiLink = /^\/([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)-([\w\d]+)$/.test(el.attribs.href);
	var clone;
        if (isContentApiLink) {
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
};
