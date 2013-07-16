'use strict';

  /* CONSTANTS */
var STATUS_MESSAGE_PREFIX = 'FT API Response: ',
  TEMP_FAILURE_MESSAGE = 'FT API: Request to {0} temporarily failed. Retrying...',
  FAILURE_MESSAGE = 'FT API: Request to {0} failed after {1} retries.',
  MESSAGES_BY_STATUS_CODE,
  LOG_LEVEL_NONE = 0,
  LOG_LEVEL_ERROR = 1,
  LOG_LEVEL_INFO = 2,
  DEFAULT_LOG_LEVEL = LOG_LEVEL_ERROR; // Only log errors by default

MESSAGES_BY_STATUS_CODE = {
  200: STATUS_MESSAGE_PREFIX + '200: Success',
  400: STATUS_MESSAGE_PREFIX + '400: The request could not be understood by the ' +
    'server due to malformed syntax',
  401: STATUS_MESSAGE_PREFIX + '401: The request requires user authentication. ' +
    'Typically this means a valid apiKey has not been supplied',
  403: STATUS_MESSAGE_PREFIX + '403: Forbidden',
  404: STATUS_MESSAGE_PREFIX + '404: CAPI does not have this content',
  410: STATUS_MESSAGE_PREFIX + '410: Resource no longer exists',
  429: STATUS_MESSAGE_PREFIX + '429: Too many resuests, slow down!',
  500: STATUS_MESSAGE_PREFIX + '500: Internal server error',
  503: STATUS_MESSAGE_PREFIX + '503: The server is currently unable to handle the ' +
    'request, due to temporary overloading or maintenance of the server'
};

function Logger () {
  this.loggingLevel = DEFAULT_LOG_LEVEL;
}
module.exports = Logger;

/* STATIC PROPERTIES */
Logger.LOG_LEVEL_NONE = LOG_LEVEL_NONE;
Logger.LOG_LEVEL_ERROR = LOG_LEVEL_ERROR;
Logger.LOG_LEVEL_INFO = LOG_LEVEL_INFO;

/* INSTANCE PROPERTIES */
// Put log levels on instance too, so you don't have to import Logger to use them
Logger.prototype.LOG_LEVEL_NONE = LOG_LEVEL_NONE;
Logger.prototype.LOG_LEVEL_ERROR = LOG_LEVEL_ERROR;
Logger.prototype.LOG_LEVEL_INFO = LOG_LEVEL_INFO;

Logger.prototype.setLogLevel = function (level) {
  this.loggingLevel = level;
};

Logger.prototype.getLogLevel = function () {
  return this.loggingLevel;
};

Logger.prototype.log = function (message, level) {
  level = level || LOG_LEVEL_INFO; /* By default or if 'none' given, log as 'info' */
  if (this.loggingLevel >= level) {
    if (level === LOG_LEVEL_ERROR) {
      console.error(message);
    } else {
      console.log(message);
    }
  }
};

Logger.prototype.logResponse = function (statusCode, level) {
  var message = MESSAGES_BY_STATUS_CODE[statusCode];
  this.log(message, level);
};

Logger.prototype.logTempRequestFailure = function (queuedRequest) {
  var message = TEMP_FAILURE_MESSAGE.replace('{0}', queuedRequest.url);
  this.log(message, Logger.LOG_LEVEL_INFO);
};

Logger.prototype.logRequestRetryFailure = function (queuedRequest) {
  var message = FAILURE_MESSAGE.replace('{0}', queuedRequest.url)
    .replace('{1}', queuedRequest.retryCount);
  this.log(message, Logger.LOG_LEVEL_ERROR);
};
