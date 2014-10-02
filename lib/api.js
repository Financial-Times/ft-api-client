'use strict';

var request = require('request');
var model = require('../models');
var _ = require('lodash');
var debug = require('debug')('ft-api-client:api')
var v1 = require('../lib/v1');

var FtApi = function (apikey) {
    this.apiKey = apikey;
    this.headers = { 
        'user-agent':   'https://github.com/Financial-Times/ft-api-client - v3.x',
        'content-type': 'application/json'
    };
}; 

FtApi.prototype.search = function () {
    return v1.search.apply(this, arguments);
}

FtApi.prototype.get = function () {
    return v1.items.apply(this, arguments);
}

FtApi.prototype.getPage = 
    


/**
 * Export
 */
module.exports = function (apikey) {
    return new FtApi(apikey);
};


