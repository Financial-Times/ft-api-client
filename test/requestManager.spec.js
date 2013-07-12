'use strict';

  /* MOCK CONTEXT DEPENDENCIES */
var MOCK_REQUEST = jasmine.createSpy(),
  CONTEXT_MOCKS = {
    request: MOCK_REQUEST
  },
  /* DEPENDENCIES */
  loadModule = require('./utils/module-loader.js').loadModule,
  requestManagerContext = loadModule('lib/requestManager.js', CONTEXT_MOCKS),
  requestManager = requestManagerContext.exports,

  /* MOCK ARGUMENTS */
  MOCK_LOGGER = {
    log: jasmine.createSpy(),
    logResponse: jasmine.createSpy()
  },
  MOCK_QUEUED_REQUEST = {
    logger: MOCK_LOGGER,
    notifyCompleted: jasmine.createSpy(),
    completedCallback: jasmine.createSpy()
  };

describe('Request Manager', function () {
  describe('getItemFromUrl', function () {
    it('makes a request for json to the passed url', function () {
      var stubUrl, stubCallback;
      // Given a mock request module as above, and a stub url and callback
      stubUrl = 'http://www.google.com/';
      stubCallback = function () {};
      // When we get the item for the given url
      requestManager.getItemFromUrl(stubUrl, MOCK_LOGGER, stubCallback);
      // Then request should have been called, with the given url and json flag
      expect(MOCK_REQUEST).toHaveBeenCalled();
      expect(MOCK_REQUEST.mostRecentCall.args[0]).toEqual({url: stubUrl, json: true});
    });

    it('passes a callback to the request that will call handleResponse', function () {
      var stubUrl, stubCallback, requestCallback;
      // Given a mock request module as above, and a stub url and callback
      stubUrl = 'http://www.google.com/';
      stubCallback = function () {};
      spyOn(requestManager, 'handleResponse');

      // When we get the item for the given url, with the spy callback
      requestManager.getItemFromUrl(stubUrl, MOCK_LOGGER, stubCallback);

      // Then the mock request object should have been passed a callback
      requestCallback = MOCK_REQUEST.mostRecentCall.args[1];
      expect(requestCallback).toBeDefined();
      expect(typeof requestCallback).toEqual('function');
      // And that callback should call handleResponse
      expect(requestManager.handleResponse).not.toHaveBeenCalled();
      requestCallback();
      expect(requestManager.handleResponse).toHaveBeenCalled();
    });
  });

  describe('handleResponse', function () {
    it('logs the error to the queued request\'s logger if a defined error is passed',
    function () {
      var stubError, stubResponse;

      // Given a mock logger in a mock queued request as above, and a defined error object
      expect(MOCK_QUEUED_REQUEST.logger).toBe(MOCK_LOGGER);
      stubError = {};
      stubResponse = {statusCode: 200};


      // When we call handle response with the args
      requestManager.handleResponse(
        stubError, stubResponse, {}, MOCK_QUEUED_REQUEST
      );

      // Then the queued request's logger.log has been called with the error
      expect(MOCK_QUEUED_REQUEST.logger.log).toHaveBeenCalled();
      expect(MOCK_QUEUED_REQUEST.logger.log.mostRecentCall.args[0]).toBe(stubError);
    });

    it('logs the response code to the queued request\'s logger if no error is defined',
    function () {
      var stubError, stubResponse;

      // Given a mock logger in a mock queued request as above, and a null error object
      expect(MOCK_QUEUED_REQUEST.logger).toBe(MOCK_LOGGER);
      stubError = null;
      stubResponse = {statusCode: 200};

      // When we call handle response
      requestManager.handleResponse(
        stubError, stubResponse, {}, MOCK_QUEUED_REQUEST
      );

      // Then the queued request's logger.logResponse has been called with the status code
      expect(MOCK_QUEUED_REQUEST.logger.logResponse).toHaveBeenCalled();
      expect(MOCK_QUEUED_REQUEST.logger.logResponse.mostRecentCall.args[0])
        .toBe(stubResponse.statusCode);
    });

    it('notifies the queued request it is completed, passing the error and item',
    function () {
      var stubError, stubItem, stubResponse;
      // Given a stub error, stub response, stub item and a mock queued request as above
      stubError = {foo: 'bar'};
      stubItem = {baz: 'quux'};
      stubResponse = {statusCode: 200};

      // When we call handleResponse
      requestManager.handleResponse(
        stubError, stubResponse, stubItem, MOCK_QUEUED_REQUEST
      );

      // Then queued request's notifycompleted has been called with the error and item
      expect(MOCK_QUEUED_REQUEST.notifyCompleted)
        .toHaveBeenCalledWith(stubError, stubItem);
    });
  });
});
