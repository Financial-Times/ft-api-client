'use strict';

require('es6-promise').polyfill();

var EventEmitter = require('events').EventEmitter;
var v1           = require('../lib/v1');
var pagesPoller  = require('../jobs/pages');

var e = new EventEmitter();

var defaultConfig = {
    timeout: 2000,
    errorHandler: function (err) {
        require('debug')('ft-api-client:api')(err);
    },
    elasticSearchKey: null
};

var FtApi = function (apikey, config) {
    if (config) {
        this.config = config;
        Object.keys(defaultConfig).forEach(function (key) {
            if (typeof config[key] === 'undefined') {
                config[key] = defaultConfig[key];
            }
        });
    } else {
        this.config = defaultConfig;
    }

    this.apiKey = apikey;
    this.headers = {
        'user-agent':   'https://github.com/Financial-Times/ft-api-client - v3.x',
        'content-type': 'application/json'
    };
    pagesPoller.init(apikey);
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

FtApi.prototype.mget = function () {
    return v1.mget.apply(this, arguments);
};

FtApi.prototype.pageInfo = function () {
    return v1.pageInfo.apply(this, arguments);
};

/**
 * Export
 */

module.exports = function (apikey, config) {
    return new FtApi(apikey, config);
};
