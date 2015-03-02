'use strict';

require('es6-promise').polyfill();

var EventEmitter = require('events').EventEmitter;
var pagesPoller  = require('./lib/jobs/pages');

var defaultConfig = {
	timeout: 2000,
	errorHandler: function (err) {
		require('debug')('ft-api-client:api:error')(err);
	},
	elasticSearchUri: null,
	pollForPages: true
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


	this.apikey = apikey;
	if (this.config.pollForPages) {
		pagesPoller.init(apikey);
	}
};

// mixin the EventEmitter methods
Object.getOwnPropertyNames(EventEmitter.prototype).forEach(function (fn) {
	FtApi.prototype[fn] = EventEmitter.prototype[fn];
});

FtApi.prototype.search = require('./lib/api/search');

FtApi.prototype.get = require('./lib/api/get');

FtApi.prototype.mget = require('./lib/api/mget');

FtApi.prototype.pageInfo = require('./lib/api/page-info');

FtApi.prototype.page = require('./lib/api/page');

FtApi.prototype.request = require('./lib/utils/request');

FtApi.prototype.elasticSearch = require('./lib/api/elasticSearch');

module.exports = function (apikey, config) {
	return new FtApi(apikey, config);
};

module.exports.models = {
	v1: {
		Article: require('./lib/models/article')
	}
};
