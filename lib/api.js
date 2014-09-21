

var request = require('request');
var model = require('../models');

var headers = { 
    'user-agent': 'https://github.com/Financial-Times/ft-api-client - v3.x'
};

var FtApi = function (apikey) {
    this.apiKey = apikey;
} 

FtApi.prototype.search = function (term) {
    
    var self = this;
   
    var searchBodyTemplate = {};

    var promiseOfSearch = function(term) {
        return function(resolve, reject) { 
            request({
                    url: 'http://api.ft.com/content/search/v1',
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: headers,
                    method: 'post',
                    body: '*'  // FIXME model.searchQuery
                }, function (err, response, body) {
                  
                    if (err) return reject(err);
                    
                    if (response.statusCode >= 400) {
                        resolve(undefined);
                    }

                    try {
                        var body = JSON.parse(body);
                    } catch (error) {
                        return reject('error parsing JSON');
                    }
                   
                    // FIXME - handle 404 and/or no results)
                    
                    // return an array of articles
                    resolve(body.results[0].results.map( function (article) {
                            return new model.Article({ item: article }) // make it look like an normal Content API body
                        })
                    );
            })
        }
    }
    return new Promise(promiseOfSearch(term));
}

/**
 * Gets one or more resources from the ApI
 */
FtApi.prototype.get = function (id) {

    var self = this;
        
    var promiseOfArticle = function(id) {
        return function(resolve, reject) { 
            request({
                    url: 'http://api.ft.com/content/items/v1/' + id,
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: headers
                }, function (err, response, body) {
                    
                    if (err) return reject(err);
                    
                    if (response.statusCode >= 400) {
                        resolve(undefined);
                    }

                    try {
                        var body = JSON.parse(body);
                    } catch (error) {
                        return reject('error parsing JSON');
                    }
                    
                    resolve(new model.Article(body));
            })
        }
    }

    if (id instanceof Array) {
        
        var promises = id.map(function (i) {
            return new Promise(promiseOfArticle(i));
        })
        
        return Promise.all(promises);

    } else {

        return new Promise(promiseOfArticle(id));
    
    }

}

/**
 * Export
 */
module.exports = function (apikey, opts) {
    return new FtApi(apikey, opts);
};


