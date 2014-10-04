
var request = require('request');
var model = require('../../models');
var debug = require('debug')('ft-api-client:api:items')

module.exports = function (id) {

    var self = this;
        
    var promiseOfArticle = function(id) {
        return function(resolve, reject) {
            
            var endpoint = 'http://api.ft.com/content/items/v1/' + id;
            
            debug('requested %s', endpoint);
            
            request({
                    url: endpoint,
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: self.headers,
                    timeout: 2000
                }, function (err, response, body) {
                    
                    if (err) {
                        debug('rejected - %s', endpoint);
                        return reject(err);
                    }
                    
                    debug('resolved %s %s', endpoint, response.statusCode);
                    
                    if (response.statusCode >= 400) {
                        resolve(undefined); // so as not to fail the Promise.all when we get a 4xx or 5xx we mask it
                    }

                    try {
                        body = JSON.parse(body);
                    } catch (error) {
                        debug('rejected - could not parse body response for %s', endpoint);
                        return reject('error parsing JSON');
                    }
                    
                    resolve(new model.Article(body));
            });
        };
    };

    debug('received a request to fetch %s', id);
    
    if (id instanceof Array) {
        var promises = id.map(function (i) {
            return new Promise(promiseOfArticle(i));
        });
        return Promise.all(promises);
    } else {
        return new Promise(promiseOfArticle(id));
    }

};
