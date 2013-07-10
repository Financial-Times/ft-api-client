'use strict';

  /* MOCK DEPENDENCIES */
var MOCK_LOGGER = {
    log: jasmine.createSpy(),
    logResponse: jasmine.createSpy()
  },
  MOCK_REQUEST = jasmine.createSpy(),
  CONTEXT_MOCKS = {
    request: MOCK_REQUEST
  },
  /* DEPENDENCIES */
  loadModule = require('./utils/module-loader.js').loadModule,
  requestManagerContext = loadModule('lib/requestManager.js', CONTEXT_MOCKS),
  requestManager = requestManagerContext.exports;

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
    var SPY_CALLBACK = jasmine.createSpy();

    it('logs the error to the passed logger if a defined error is passed', function () {
      var stubError, stubResponse;

      // Given a mock logger as above, and a defined error object
      stubError = {};
      stubResponse = {statusCode: 200};

      // When we call handle response
      requestManager.handleResponse(
        stubError, stubResponse, {}, MOCK_LOGGER, SPY_CALLBACK
      );

      // Then we should find that logger.log has been called with the error
      expect(MOCK_LOGGER.log).toHaveBeenCalled();
      expect(MOCK_LOGGER.log.mostRecentCall.args[0]).toBe(stubError);
    });

    it('logs the response code to the passed logger if no error is defined', function () {
      var stubError, stubResponse;

      // Given a mock logger as above, and a null error object
      stubError = null;
      stubResponse = {statusCode: 200};

      // When we call handle response
      requestManager.handleResponse(
        stubError, stubResponse, {}, MOCK_LOGGER, SPY_CALLBACK
      );

      // Then we should find that logger.logResponse has been called with the status code
      expect(MOCK_LOGGER.logResponse).toHaveBeenCalled();
      expect(MOCK_LOGGER.logResponse.mostRecentCall.args[0])
        .toBe(stubResponse.statusCode);
    });

    it('calls the callback with the passed error and passed item', function () {
      var stubError, stubItem, spyCallback, stubResponse;
      // Given stub error, stub response, stub item and a spy callback
      stubError = {foo: 'bar'};
      stubItem = {baz: 'quux'};
      stubResponse = {statusCode: 200};
      spyCallback = jasmine.createSpy();

      // When we call handleResponse
      requestManager.handleResponse(
        stubError, stubResponse, stubItem, MOCK_LOGGER, spyCallback
      );

      // Then we expect the callback to have been called with the error and item
      expect(spyCallback).toHaveBeenCalledWith(stubError, stubItem);
    });
  });
});
