'use strict';

var url     = require('url');
var util    = require('util');

// body text processing
var cheerio                 = require('cheerio');
var removeNonArticleLinks   = require('../models/cheerio/remove-non-article-links');
var relativeLinks           = require('../models/cheerio/relative-links');
var removeEmptyParagraphs   = require('../models/cheerio/remove-empty-paragraphs');
var findInboundLinks        = require('../models/cheerio/find-inbound-links');
var findOutboundLinks       = require('../models/cheerio/find-outbound-links');

function Article (obj) {
    if (obj && obj.item) {
        this.parse(obj);
    }
}

/**
 * Hydrates the model from a raw API response
 */
Article.prototype.parse = function (obj) {
    this.id = obj.item.id;
    this.raw = obj;

    var readingSpeed = 300; // wpm

    if (!this.raw.item.body) return;

    // FIXME - move to defineProperty getters
    this.wordCount = this.body.split(' ').length;
    this.readingTime = Math.round(this.wordCount / readingSpeed);
};

/**
 * Returns a given range of paragraphs from the article body
 */
Article.prototype.paragraphs = function (to, from, options) {
    options = options || {};
    var removeImages = options.removeImages !== false;
    var $ = cheerio.load(this.body);
    if (removeImages) $('img').remove('img');
    return $('p').slice(to, from);
};

/**
 * Returns a list of inbound links to other FT articles contained within the article body
 */
Object.defineProperty(Article.prototype, 'inboundLinks', {
    get: function () {
        return findInboundLinks(this.raw.item.body.body);
    }
});

/**
 * Returns a list of outbound links contained within the article body
 */
Object.defineProperty(Article.prototype, 'outboundLinks', {
    get: function () {
        return findOutboundLinks(this.raw.item.body.body);
    }
});

/**
 * Returns the article headline
 */
Object.defineProperty(Article.prototype, 'headline', {
    get: function () {
        if (this.raw.item.title) {
            return this.raw.item.title.title
        }
        return false;
    }
});

Object.defineProperty(Article.prototype, 'spHeadline', {
    get: function () {
        if (this.raw.item.packaging) {
            return this.raw.item.packaging.spHeadline;
        }
        return false;
    }
});

Object.defineProperty(Article.prototype, 'subheading', {
    get: function () {
        if (this.raw.item.editorial) {
            return this.raw.item.editorial.subheading;
        }
        return false;
    }
});

Object.defineProperty(Article.prototype, 'leadBody', {
    get: function () {
        if (this.raw.item.editorial) {
            return this.raw.item.editorial.leadBody;
        }
        return false;
    }
});

Object.defineProperty(Article.prototype, 'standFirst', {
    get: function () {
        if (this.raw.item.editorial) {
            return this.raw.item.editorial.standFirst;
        }
        return false;
    }
});


Object.defineProperty(Article.prototype, 'excerpt', {
    get: function () {
        if (this.raw.item.summary) {
            return this.raw.item.summary.excerpt;
        }
        return false;
    }
});


/**
 * Returns a list of package id's
 */
Object.defineProperty(Article.prototype, 'packages', {
    get: function () {
        if (this.raw.item.package) {
            return this.raw.item.package.map(function (currentPackage) {
                return currentPackage.id;
            });
        }
        return [];
    }
});

/**
 * Returns a list of authors
 */
Object.defineProperty(Article.prototype, 'authors', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.authors) {
            return this.raw.item.metadata.authors.map(function (author) {
                author.term.searchString = 'authors:"' + author.term.name + '"';
                return author.term;
            });
        }
        return [];
    }
});

/**
 * Returns a list of people
 */
Object.defineProperty(Article.prototype, 'people', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.people) {
            return this.raw.item.metadata.people.map(function (person) {
                person.term.searchString = 'people:"' + person.term.name + '"';
                return person.term;
            });
        }
        return [];
    }
});

/**
 * Returns a list of organisations
 */
Object.defineProperty(Article.prototype, 'organisations', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.organisations) {
            return this.raw.item.metadata.organisations.map(function (org) {
                org.term.searchString = 'organisations:"' + org.term.name + '"';
                return org.term;
            });
        }
        return [];
    }
});

/**
 * Returns a list of countries, places etc.
 */
Object.defineProperty(Article.prototype, 'regions', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.regions) {
            return this.raw.item.metadata.regions.map(function (region) {
                region.term.searchString = 'regions:"' + region.term.name + '"';
                return region.term;
            });
        }
        return [];
    }
});

/**
 * Returns a list of topics
 */
Object.defineProperty(Article.prototype, 'topics', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.topics) {
            return this.raw.item.metadata.topics.map(function (topic) {
                topic.term.searchString = 'topics:"' + topic.term.name + '"';
                return topic.term;
            });
        }
        return [];
    }
});

/**
 * Returns a list of subjects the article is about
 */
Object.defineProperty(Article.prototype, 'subjects', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.subjects) {
            return this.raw.item.metadata.subjects.map(function (subject) {
                subject.term.searchString = 'subjects:"' + subject.term.name + '"';
                return subject.term;
            });
        }
        return [];
    }
});

/**
 * Returns a list of stock market ticker symbols related to the article
 */
Object.defineProperty(Article.prototype, 'tickerSymbols', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.tags) {
            return this.raw.item.metadata.tags.filter(function (tag) {
                return tag.term.attributes.some(function(attribute) {
                    return attribute.key === 'FTSymbol';
                });
            }).map(function (company) {
                return {
                    name: company.term.name,
                    code: company.term.attributes.filter(function (attribute) {
                        return attribute.key === 'FTSymbol';
                    })[0].value
                };
            });
        }
        return [];
    }
});

/**
 * Returns a the genre. For simplicity articles only have one genre.
 */
Object.defineProperty(Article.prototype, 'genre', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.genre) {
            return this.raw.item.metadata.genre[0].term.name;
        }
        return undefined;
    }
});

/**
 * Returns the brand. For simplicity articles only have one brand.
 */
Object.defineProperty(Article.prototype, 'brand', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.brand && this.raw.item.metadata.brand.length) {
            return this.raw.item.metadata.brand[0].term;
        }
        return undefined;
    }
});


/**
 * Returns the tone, either - News, Comment, Analysis or Video - and default to
 * news.
 */
Object.defineProperty(Article.prototype, 'visualTone', {
    get: function () {
        if (this.has_video) {
            return 'video';
        } else {
            switch (this.genre) {
                case 'Analysis':
                    return 'analysis';
                case 'Comment':
                    return 'comment';
                case 'News':
                    return 'news';
                default:
                    return 'vanilla';
            }
        }
    }
});

/**
 * Returns a the primary section object
 */
Object.defineProperty(Article.prototype, 'primarySection', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.primarySection) {
            var term = this.raw.item.metadata.primarySection.term;
            term.searchString = term.taxonomy + ':"' + term.name + '"';
            return term;
        }
        return [];
    }
});

/**
 * Returns a the primary theme object
 */
Object.defineProperty(Article.prototype, 'primaryTheme', {
    get: function () {
        if (this.raw.item.metadata && this.raw.item.metadata.primaryTheme) {
            var term = this.raw.item.metadata.primaryTheme.term;
            term.searchString = term.taxonomy + ':"' + term.name + '"';
            return term;
        }
        return [];
    }
});

/**
 * The resource's published date as a JavaScript Date object.
 */
Object.defineProperty(Article.prototype, 'firstPublished', {
    get: function () {
        return new Date(this.raw.item.lifecycle.initialPublishDateTime);
    }
});

/*
 * The resource's last updated date as a JavaScript Date object.
 */
Object.defineProperty(Article.prototype, 'lastUpdated', {
    get: function () {
        return new Date(this.raw.item.lifecycle.lastPublishDateTime);
    }
});

/**
 * Indicates that the article contains a video.
 * @return Boolean
 */
Object.defineProperty(Article.prototype, 'has_video', {
    get: function () {
        if (this.raw.item.assets) {
            return this.raw.item.assets.some(function (asset) {
                return asset.type === 'video';
            });
        } else {
            return false;
        }
    }
});

/**
 * Returns a list of videos associated with the article
 * @return Array
 */
Object.defineProperty(Article.prototype, 'videos', {
    get: function () {
        if (this.raw.item.assets) {
            return this.raw.item.assets.filter(function (asset) {
                return asset.type === 'video';
            });
        } else {
            return [];
        }
    }
});

/**
 * Indicates that the article contains a gallery.
 * @return Boolean
 */
Object.defineProperty(Article.prototype, 'has_gallery', {
    get: function () {
        if (this.raw.item.assets) {
            return this.raw.item.assets.some(function (asset) {
                return asset.type === 'slideshow';
            });
        } else {
            return false;
        }
    }
});

/**
 * Returns a list of slideshows associated with the article
 * @return Array
 */
Object.defineProperty(Article.prototype, 'galleries', {
    get: function () {
        if (this.raw.item.assets) {
            return this.raw.item.assets.filter(function (asset) {
                return asset.type === 'slideshow';
            });
        } else {
            return [];
        }
    }
});


/**
 * Extracts the pull quotes from the article assets
 * @return Object
 */
Object.defineProperty(Article.prototype, 'quotes', {
    get: function () {
        if (this.raw.item.assets) {
            return this.raw.item.assets.filter(function (asset) {
                return asset.type === 'pullQuote';
            });
        } else {
            return [];
        }
    }
});

/**
 * The article body as HTML.
 */
Object.defineProperty(Article.prototype, 'body', {
    get: function () {

        var html = this.raw.item.body.body;

        try {
            return removeNonArticleLinks(relativeLinks(removeEmptyParagraphs(html)));
        } catch (e) {
            console.error('Error parsing article body', e);
            return '<p>Error parsing this article.</p>';
        }


    }
});

/**
 * The largest image (ie. in pixels) that is associated with the resource
 */
Object.defineProperty(Article.prototype, 'largestImage', {
    get: function () {
        if (this.raw.item.images) {
            var images = {};

            this.raw.item.images.forEach(function(img) {
                images[img.type] = img;
            });
            return images['wide-format'] || images['article'] || images['primary'];
        }
    }
});

Object.defineProperty(Article.prototype, 'isWeekend', {
    get: function () {
        return !!(this.raw.item.usage && this.raw.item.usage.publications.some(function (pub) {
            return pub.name === 'FT Weekend';
        }));
    }
});

module.exports = Article;
