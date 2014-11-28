'use strict';
var v1 = require('../lib/v1');

var defaultConfig = {
    timeout: 2000
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
};

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
module.exports = function (apikey, config) {
    return new FtApi(apikey, config);
};
