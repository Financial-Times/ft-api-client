

var request = require('request');
var model = require('../models');

var FtApi = function (apikey) {
    this.apiKey = apikey;
} 

FtApi.prototype.get = function (id) {
    
    var headers = { 
        'user-agent': 'https://github.com/Financial-Times/ft-api-client - v3.0.0'
    };

    var self = this;

    return new Promise(
        function(resolve, reject) { 
            request({
                    url: 'http://api.ft.com/content/items/v1/' + id,
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: headers
                }, function (err, response, body) {
                    
                    if (err) {
                        reject(err);
                    }

                    resolve(new model.Article(JSON.parse(body)));
            })
        }
    );

}

/**
 * Export
 */
module.exports = function (apikey, opts) {
    return new FtApi(apikey, opts);
};


