

var request = require('request');
var model = require('../models');

var FtApi = function (apikey) {
    this.apiKey = apikey;
} 

FtApi.prototype.get = function (id) {

    var headers = { 
        'user-agent': 'https://github.com/Financial-Times/ft-api-client - v3.x'
    };

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
                    
                    if (err) {
                        return reject(err);
                    }

                    if (err) return reject(err);
                    if (response.statusCode >= 400) return reject(response)

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


