
var cheerio = require('cheerio')
var url     = require('url')

function Article (obj) {
    obj && this.parse(obj);
}

Article.prototype.parse = function (obj) {
    this.id = obj.item.id;
    this.raw = obj;
    this._dom = cheerio.load(obj.item.body.body);
}

Object.defineProperty(Article.prototype, 'body', {
    get: function () {

        // Fix any old ft links, Eg. 
        //  www.ft.com/cms/s/43515588-00fc-11e4-a938-00144feab7de.html -> /43515588-00fc-11e4-a938-00144feab7de 
        this._dom('a').attr('href', function (index, value) {
            var path = url.parse(value).pathname;
            var re = /\/([^\/]+)\.html$/.exec(path);
            if (re) {
                return '/' + re[1]; 
            }
            return value;
        });
        return this._dom.html();
    }
});


Object.defineProperty(Article.prototype, 'largestImage', {
    get: function () {
        if (this.raw.item.images) {
            var x = this.raw.item.images.sort(function (a, b) {
                return a.width < b.width
            });
            return x[0];
        }
        return undefined;
    }
})

module.exports = Article;
