'use strict';
var request = require('request');
var sanitise = require('./sanitise-request');
var debug = require('debug')('ft-api-client:api');

module.exports = function (url, method, body) {
    var self = this;
    var opts = {
        qs: {
            apiKey: this.apikey,
            'feature.blogposts': 'on',
            'feature.usage': 'on'
        },
        headers: {
            'user-agent':   'https://github.com/Financial-Times/ft-api-client - v3.x',
            'content-type': 'application/json'
        },
        timeout: this.config.timeout,
        url: url
    };
    
    method = method || 'get';
    var requestStart = new Date();
    return new Promise(function (resolve, reject) {
        request[method](opts, function (err, response, body) {
            sanitise.call(self, {
                response: response,
                body: body,
                err: err,
                requestStart: requestStart,
                resolve: resolve,
                reject: reject,
                url: url
            });
        });
    });
};
