'use strict';

var v1 = require('../lib/v1');
var EventEmitter = require('events').EventEmitter;

var e = new EventEmitter();

var FtApi = function (apikey) {
    this.apiKey = apikey;
    this.headers = { 
        'user-agent':   'https://github.com/Financial-Times/ft-api-client - v3.x',
        'content-type': 'application/json'
    };
};

// mixin the EventEmitter methods 
Object.getOwnPropertyNames(EventEmitter.prototype).forEach(function (fn) {
    FtApi.prototype[fn] = e[fn];
});

FtApi.prototype.search = function () {
    return v1.search.apply(this, arguments);
};

FtApi.prototype.get = function () {
    return v1.items.apply(this, arguments);
};

FtApi.prototype._request = function () {
    return v1.request.apply(this, arguments);
};

/**
 * Export
 */
module.exports = function (apikey) {
    return new FtApi(apikey);
};
