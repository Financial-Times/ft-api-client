'use strict';

var loadModule = require('./utils/module-loader.js').loadModule,
  LoggerContext = loadModule('lib/Logger.js'),
  /* Don't use the logger from the context, or we'll struggle to spy on console log */
  Logger = require('../lib/Logger.js'),
  logger = new Logger();

describe('Logger', function () {
  var LOGGING_LEVELS = ['LOG_LEVEL_NONE', 'LOG_LEVEL_INFO', 'LOG_LEVEL_ERROR'];

  describe('instance', function () {
    it('has log and logResponse calls',
    function () {
      // Given a logger as above
      // When we inspect it
      // We should find log and logResponse are defined
      expect(logger.log).toBeDefined();
      expect(logger.logResponse).toBeDefined();
      // And are functions
      expect(typeof logger.log).toEqual('function');
      expect(typeof logger.logResponse).toEqual('function');
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

  describe('module', function () {
    it('exports log level enums for none, info and error',
    function () {
      // Given a logger moddule
      // When we have a look at her
      // Then we expect there to be keys for the following
      LOGGING_LEVELS.forEach(function (logLevelKey) {
        expect(Logger[logLevelKey]).toBeDefined();
      });

      // And for them to have unique values
      expect(Logger.LOG_LEVEL_NONE).not.toEqual(Logger.LOG_LEVEL_INFO);
      expect(Logger.LOG_LEVEL_NONE).not.toEqual(Logger.LOG_LEVEL_ERROR);
      expect(Logger.LOG_LEVEL_INFO).not.toEqual(Logger.LOG_LEVEL_ERROR);
    });
  });

  // TODO: Fix and re-activate these specs at some point soon
  xdescribe('log response method', function () {
    it('logs the corresponding status message for each code',
    function () {
      var statusCode, messageForCode, messagesByCode;
      // Given a set of messages for each status code
      messagesByCode = LoggerContext.MESSAGES_BY_STATUS_CODE;
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

  xdescribe('log method', function () {
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

  xit('logs a temporary request failure by logging a message with the url',
  function () {

  });

  xit('logs a request retry failure by logging a message with the url and retry count',
  function () {

  });
});
