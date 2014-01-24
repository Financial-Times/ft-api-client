'use strict';

var PathMapper = require('./lib/PathMapper.js'),
  Logger = require('./lib/Logger.js'),
  RequestManager = require('./lib/requestManager.js'),
  contentCalls = require('./lib/contentCalls.js'),
  notificationsCalls = require('./lib/notificationsCalls.js');

var rm = new RequestManager();

function FtApi (apiKey, optionalLogLevel) {
  if (typeof apiKey !== 'string' || apiKey === '') {
    throw new TypeError('The FT API constructor requires an API key, ' +
        'which must be a non-empty string');
  }

  this.pathMapper = new PathMapper(apiKey);
  this.logger = new Logger();
  this.requestManager = rm;

  if (typeof optionalLogLevel !== 'undefined') {
    this.setLogLevel(optionalLogLevel);
  }

  contentCalls.mixInTo(this);
  notificationsCalls.mixInTo(this);
}

/* LOGGING */
/* Note that this is not a per-instance level. Should instance-ise later */
FtApi.prototype.setLogLevel = function (logLevel) {
  this.logger.setLogLevel(logLevel);
};

FtApi.prototype.getLogLevel = function () {
  return this.logger.getLogLevel();
};

/* STATIC FLAGS */
FtApi.LOG_LEVEL_NONE = Logger.LOG_LEVEL_NONE;
FtApi.LOG_LEVEL_INFO = Logger.LOG_LEVEL_INFO;
FtApi.LOG_LEVEL_ERROR = Logger.LOG_LEVEL_ERROR;

module.exports = FtApi;
