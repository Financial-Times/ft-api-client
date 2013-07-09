'use strict';

var loadModule = require('./utils/module-loader.js').loadModule,
  loggerContext = loadModule('lib/logger.js'),
  logger = loggerContext.exports;

describe('Logger', function () {
  describe('module exports', function () {
    var LOGGING_LEVELS = ['LOG_LEVEL_NONE', 'LOG_LEVEL_INFO', 'LOG_LEVEL_ERROR'];

    it('returns a singleton logger, such that each inclusion is the same instance',
    function () {
      var loggerA, loggerB;
      // Given two logger modules that we require in
      loggerA = require('../lib/logger.js');
      loggerB = require('../lib/logger.js');
      // When we compare them
      // Then we should find they are equal and the same objects
      expect(loggerA).toEqual(loggerB);
      expect(loggerA).toBe(loggerB);
    });

    it('exports log and logResponse calls',
    function () {
      // Given a logger
      // When we inspect it
      // We should find log and logResponse are defined
      expect(logger.log).toBeDefined();
      expect(logger.logResponse).toBeDefined();
      // And are functions
      expect(typeof logger.log).toEqual('function');
      expect(typeof logger.logResponse).toEqual('function');
    });

    it('exports log level enums for none, info and error',
    function () {
      // Given a logger
      // When we have a look at her
      // Then we expect there to be keys for the following
      LOGGING_LEVELS.forEach(function (logLevelKey) {
        expect(logger[logLevelKey]).toBeDefined();
      });

      // And for them to have unique values
      expect(logger.LOG_LEVEL_NONE).not.toEqual(logger.LOG_LEVEL_INFO);
      expect(logger.LOG_LEVEL_NONE).not.toEqual(logger.LOG_LEVEL_ERROR);
      expect(logger.LOG_LEVEL_INFO).not.toEqual(logger.LOG_LEVEL_ERROR);
    });

    it('exports a getter and setter for logging level',
    function () {
      // Given an arbitrary logging level and a logger
      // For each logging level
      LOGGING_LEVELS.forEach(function (logLevelKey) {
        // When we set the logger log level
        logger.setLogLevel(logLevelKey);
        // Then it should be returned by the getter
        expect(logger.getLogLevel()).toEqual(logLevelKey);
      });
    });
  });

  describe('log response method', function () {
    it('logs the corresponding status message for each code',
    function () {
      var statusCode, messageForCode, messagesByCode;
      // Given a set of messages for each status code
      messagesByCode = loggerContext.MESSAGES_BY_STATUS_CODE;
      // And a logger set to log level info
      logger.setLogLevel(logger.LOG_LEVEL_INFO);
      // And a mock console log
      spyOn(console, 'log');

      // For each status code and corresponding message
      for (statusCode in messagesByCode) {
        if (messagesByCode.hasOwnProperty(statusCode)) {
          messageForCode = messagesByCode[statusCode];

          // When we call logResponse with the same logging level
          logger.logResponse(statusCode, logger.LOG_LEVEL_INFO);

          // Then console.log should have been called with the status message for the code
          expect(console.log).toHaveBeenCalled();
          expect(console.log).toHaveBeenCalledWith(messageForCode);
        }
      }
    });
  });

  describe('log method', function () {
    it('doesn\'t log if logger level is log level none',
    function () {
      // Given a logger on log level none and a spy on console log
      logger.setLogLevel(logger.LOG_LEVEL_NONE);
      spyOn(console, 'log');
      // When we log messages with no logging level, none, error and info
      logger.log('foo');
      logger.log('foo', logger.LOG_LEVEL_NONE);
      logger.log('foo', logger.LOG_LEVEL_ERROR);
      logger.log('foo', logger.LOG_LEVEL_INFO);
      // Then we should find that console log has not been called
      expect(console.log).not.toHaveBeenCalled();
    });

    it('logs only errors if logger level is log level error',
    function () {
      // Given a logger on log level error and a spy on console log
      logger.setLogLevel(logger.LOG_LEVEL_ERROR);
      spyOn(console, 'log');
      // When we log messages with no logging level, none, error and info
      logger.log('foo');
      logger.log('foo', logger.LOG_LEVEL_NONE);
      logger.log('foo', logger.LOG_LEVEL_ERROR);
      logger.log('foo', logger.LOG_LEVEL_INFO);
      // Then we should find that console log has been called once
      expect(console.log).toHaveBeenCalled();
      expect(console.log.callCount).toEqual(1);
    });

    it('logs all messages if logger level is log level info',
    function () {
      // Given a logger on log level info and a spy on console log
      logger.setLogLevel(logger.LOG_LEVEL_INFO);
      spyOn(console, 'log');
      // When we log messages with no logging level, none, error and info
      logger.log('foo');
      logger.log('foo', logger.LOG_LEVEL_NONE);
      logger.log('foo', logger.LOG_LEVEL_ERROR);
      logger.log('foo', logger.LOG_LEVEL_INFO);
      // Then we should find that console log has been called four times
      expect(console.log).toHaveBeenCalled();
      expect(console.log.callCount).toEqual(4);
    });
  });
});
