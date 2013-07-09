'use strict';

var loadModule = require('./utils/module-loader.js').loadModule,
  loggerContext = loadModule('modules/logger.js'),
  logger = loggerContext.exports;

describe('Logger', function () {
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

  it('log response logs the corresponding status message for each code',
  function () {
    var statusCode, messageForCode, messagesByCode;
    // Given a set of messages for each status code
    messagesByCode = loggerContext.MESSAGES_BY_STATUS_CODE;
    // And a mock console log
    spyOn(console, 'log');

    // For each status code and corresponding message
    for (statusCode in messagesByCode) {
      if (messagesByCode.hasOwnProperty(statusCode)) {
        messageForCode = messagesByCode[statusCode];

        // When we call logResponse
        logger.logResponse(statusCode);

        // Then console.log should have been called with the status message for the code
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(messageForCode);
      }
    }
  });

  it('log just logs to console log',
  function () {
    // Given a logger
    // When we inspect it's log property
    // Then we find it is console.log
    expect(logger.log).toEqual(console.log);
  });
});
