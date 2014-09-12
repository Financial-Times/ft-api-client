
var cheerio = require('cheerio')

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

        // Relativise any ft links
        this._dom('a').attr('href', function (index, value) {
            if (/^http:\/\/www\.ft\.com/.test(value)) {
                return value.replace('http://www.ft.com/', '/') // TODO - weed out unsupported links
            }
            return value;
        });
        return this._dom.html();
    }
});

module.exports = Article;


//
var a = new Article({ "item": { "id": "03b49444-16c9-11e3-bced-00144feabdc0", "body": { "body": '<p>US President <a href="http://www.ft.com/adsf">adf</a> body.</p>' } }  });

console.log(a.id, a.body)
