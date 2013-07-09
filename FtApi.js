'use strict';

var logger = require('./modules/logger.js'),
    ContentModule = require('./modules/Content.js'),
    NotificationsModule = require('./modules/Notifications.js');

function FtApi (apiKey) {
  if (typeof apiKey !== 'string' || apiKey === '') {
    throw new TypeError('The FT API constructor requires an API key, ' +
        'which must be a non-empty string');
  }

  this.content = new ContentModule(apiKey);
  this.notifications = new NotificationsModule(apiKey);
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
