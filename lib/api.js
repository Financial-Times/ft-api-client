'use strict';
var v1 = require('../lib/v1');

var FtApi = function (cfg) {
    this.apiKey = cfg.apiKey;
    this.elasticSearchKey = cfg.elasticSearchKey;
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

FtApi.prototype.mget = function () {
    return v1.mget.apply(this, arguments);
};

/**
 * Export
 */
module.exports = function (cfg) {
    return new FtApi(cfg);
};
