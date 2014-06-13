'use strict';

  /* CONSTANTS */
var TEMP_FAILURE_MESSAGE = 'FT API: Retrying request that temporarily failed: {0}',
  FAILURE_MESSAGE = 'FT API: Request failed after {0} retries: {1}',
  ERROR_MESSAGE = 'FT API: {0} Error {1} user actionable: {2}',
  SUCCESS_MESSAGE = 'FT API: Request Success: {0}',
  LOG_LEVEL_NONE = 0,
  LOG_LEVEL_ERROR = 1,
  LOG_LEVEL_INFO = 2,
  DEFAULT_LOG_LEVEL = LOG_LEVEL_ERROR; // Only log errors by default

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
      console.error(JSON.stringify(message));
    } else {
      console.log(JSON.stringify(message));
    }
  }
};

Logger.prototype.logRequestError = function (error, queuedRequest, cached) {
  var errorMessage =
    ERROR_MESSAGE.replace('{0}', error.message)
                 .replace('{1}', (error.isUserActionable ? 'IS' : 'is NOT'))
                 .replace('{2}', queuedRequest.url);
  
  this.log({
    timestamp: new Date().toISOString(),
    success: false,
    message: errorMessage,
    type: 'failure',
    cached: !!cached
  }, Logger.LOG_LEVEL_ERROR);
};

Logger.prototype.logRequestSuccess = function (queuedRequest, cached) {
  var successMessage =
    SUCCESS_MESSAGE.replace('{0}', queuedRequest.url);

  this.log({
    timestamp: new Date().toISOString(),
    success: true,
    message: successMessage,
    type: 'success',
    cached: !!cached
  }, Logger.LOG_LEVEL_INFO);
};

Logger.prototype.logTempRequestFailure = function (queuedRequest, cached) {
  var message =
    TEMP_FAILURE_MESSAGE.replace('{0}', queuedRequest.url);

  this.log({
    timestamp: new Date().toISOString(),
    success: false,
    message: message,
    type: 'tempFailure',
    cached: !!cached
  }, Logger.LOG_LEVEL_INFO);
};

Logger.prototype.logRequestRetryFailure = function (queuedRequest, cached) {
  var message =
    FAILURE_MESSAGE.replace('{0}', queuedRequest.retryCount)
                   .replace('{1}', queuedRequest.url);

  this.log({
    timestamp: new Date().toISOString(),
    success: false,
    message: message,
    type: 'failure',
    cached: !!cached
  } , Logger.LOG_LEVEL_ERROR);
};
