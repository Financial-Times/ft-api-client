'use strict';

var Logger = require('../lib/Logger.js'),
  logger = new Logger();

describe('Logger', function () {
  var LOGGING_LEVELS = ['LOG_LEVEL_NONE', 'LOG_LEVEL_INFO', 'LOG_LEVEL_ERROR'];

  describe('instance', function () {
    it('has log, logRequestError, logRequestSuccess, logTempRequestFailure and ' +
      'logRequestRetryFailure calls',
    function () {
      var callNames = ['log', 'logRequestError', 'logRequestSuccess',
                       'logTempRequestFailure', 'logRequestRetryFailure'];
      // Given a logger as above
      // When we inspect it
      // We should the calls above are defined
      callNames.forEach(function (callName) {
        expect(logger[callName]).toBeDefined();
        expect(typeof logger[callName]).toEqual('function');
      });
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
});
