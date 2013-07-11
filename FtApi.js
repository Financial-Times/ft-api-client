'use strict';

var ContentModule = require('./lib/Content.js'),
  NotificationsModule = require('./lib/Notifications.js'),
  contentCalls = require('./lib/contentCalls.js'),
  logger = require('./lib/logger.js'),
  PathMapper = require('./lib/PathMapper.js'),
  requestManager = require('./lib/requestManager.js');

function FtApi (apiKey) {
  if (typeof apiKey !== 'string' || apiKey === '') {
    throw new TypeError('The FT API constructor requires an API key, ' +
        'which must be a non-empty string');
  }

  this.content = new ContentModule(apiKey);
  this.notifications = new NotificationsModule(apiKey);

  this.pathMapper = new PathMapper(apiKey);
  this.logger = logger; // To be replaced with an instance soon
  this.requestManager = requestManager;

  contentCalls.mixInTo(this);
}

/* LOGGING */
/* Note that this is not a per-instance level. Should instance-ise later */
FtApi.prototype.setLogLevel = function (logLevel) {
  logger.setLogLevel(logLevel);
};

FtApi.prototype.getLogLevel = function () {
  return logger.getLogLevel();
};

/* STATIC FLAGS */
FtApi.LOG_LEVEL_NONE = logger.LOG_LEVEL_NONE;
FtApi.LOG_LEVEL_INFO = logger.LOG_LEVEL_INFO;
FtApi.LOG_LEVEL_ERROR = logger.LOG_LEVEL_ERROR;

module.exports = FtApi;
