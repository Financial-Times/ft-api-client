'use strict';

var NotificationsModule = require('./lib/Notifications.js'),
  contentCalls = require('./lib/contentCalls.js'),
  Logger = require('./lib/Logger.js'),
  PathMapper = require('./lib/PathMapper.js'),
  requestManager = require('./lib/requestManager.js');

function FtApi (apiKey) {
  if (typeof apiKey !== 'string' || apiKey === '') {
    throw new TypeError('The FT API constructor requires an API key, ' +
        'which must be a non-empty string');
  }

  this.notifications = new NotificationsModule(apiKey);

  this.pathMapper = new PathMapper(apiKey);
  this.logger = new Logger();
  this.requestManager = requestManager;

  contentCalls.mixInTo(this);
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
