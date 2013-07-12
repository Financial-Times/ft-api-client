'use strict';

  /* MOCK CONTEXT DEPENDENCIES */
var MOCK_REQUEST = jasmine.createSpy(),
  CONTEXT_MOCKS = {
    request: MOCK_REQUEST
  },
  /* DEPENDENCIES */
  loadModule = require('./utils/module-loader.js').loadModule,
  QueuedRequest = require('../lib/QueuedRequest.js'),
  RequestQueue = require('../lib/RequestQueue.js'),

  /* MOCK ARGUMENTS */
  MOCK_LOGGER = {
    log: jasmine.createSpy(),
    logResponse: jasmine.createSpy()
  },
  MOCK_QUEUED_REQUEST = {
    logger: MOCK_LOGGER,
    notifyInProgress: jasmine.createSpy(),
    notifyCompleted: jasmine.createSpy(),
    completedCallback: jasmine.createSpy()
  };

describe('Request Manager', function () {
  var requestManagerContext, requestManager;

  beforeEach(function () {
    // Reset each time to clear the internal state
    requestManagerContext = loadModule('lib/requestManager.js', CONTEXT_MOCKS);
    requestManager = requestManagerContext.exports;
  });

  describe('add to queued requests', function () {
    it('adds the passed request queue\'s requests on to the queue',
    function () {
      var requestQueue;
      requestQueue = new RequestQueue();
      spyOn(requestManager, 'dispatchNextRequest'); // Spy to prevent callthrough
      requestQueue.addRequest('foo', MOCK_LOGGER, function () {});
      requestQueue.addRequest('bar', MOCK_LOGGER, function () {});
      requestManager.addToQueuedRequests(requestQueue);
      expect(requestManager.queuedRequests[0]).toEqual(requestQueue.queue[0]);
      expect(requestManager.queuedRequests[1]).toEqual(requestQueue.queue[1]);
    });

    it('calls dispatchnextrequest if requests aren\'t in progress',
    function () {
      var requestQueue;
      // Given a fresh module, such that requests aren't in progress
      expect(requestManager.hasRequestsInProgress).toBeFalsy();
      // And a request queue with one request
      requestQueue = new RequestQueue();
      requestQueue.addRequest('foo', MOCK_LOGGER, function () {});
      // And a spy on dispatchNextRequest
      spyOn(requestManager, 'dispatchNextRequest');
      // When we add it to the queued requests
      expect(requestManager.dispatchNextRequest).not.toHaveBeenCalled();
      requestManager.addToQueuedRequests(requestQueue);
      // Then we expect dispatch next request to have been called
      expect(requestManager.dispatchNextRequest).toHaveBeenCalled();
    });
  });

  describe('dispatch next request', function () {
    it('calls make request with next request in queue, and takes it out of the queue',
    function () {
      spyOn(requestManager, 'makeRequest');
      requestManager.queuedRequests.push(MOCK_QUEUED_REQUEST);
      expect(requestManager.queuedRequests.length).toEqual(1);
      expect(requestManager.makeRequest).not.toHaveBeenCalled();
      requestManager.dispatchNextRequest();
      expect(requestManager.queuedRequests.length).toEqual(0);
      expect(requestManager.makeRequest).toHaveBeenCalledWith(MOCK_QUEUED_REQUEST);
    });

    it('sets hasRequestsInProgress true',
    function () {
      spyOn(requestManager, 'makeRequest'); // Prevent falling through with a spy
      requestManager.queuedRequests.push(MOCK_QUEUED_REQUEST);
      expect(requestManager.hasRequestsInProgress).toBeFalsy();
      requestManager.dispatchNextRequest();
      expect(requestManager.hasRequestsInProgress).toBeTruthy();
    });
  });

  describe('make request', function () {
    it('notifies the request that it\'s in progress', function () {
      expect(MOCK_QUEUED_REQUEST.notifyInProgress).not.toHaveBeenCalled();
      requestManager.makeRequest(MOCK_QUEUED_REQUEST);
      expect(MOCK_QUEUED_REQUEST.notifyInProgress).toHaveBeenCalled();
    });

    it('makes a request for json to the passed queued request\'s url', function () {
      var stubUrl, stubCallback, requestQueue, queuedRequest;
      // Given a mock request module as above, and a stub url and callback
      stubUrl = 'http://www.google.com/';
      stubCallback = function () {};
      requestQueue = new RequestQueue();
      queuedRequest = new QueuedRequest(stubUrl, stubCallback, MOCK_LOGGER, requestQueue);
      // When we make the request for the given request
      requestManager.makeRequest(queuedRequest);
      // Then the request module should have been called, with the given url and json flag
      expect(MOCK_REQUEST).toHaveBeenCalled();
      expect(MOCK_REQUEST.mostRecentCall.args[0]).toEqual({url: stubUrl, json: true});
    });

    it('passes a callback to the request module that will call handleResponse',
    function () {
      var stubUrl, stubCallback, requestCallback;
      // Given a mock request module as above, and a stub url and callback
      stubUrl = 'http://www.google.com/';
      stubCallback = function () {};
      // And a spy on handle response
      spyOn(requestManager, 'handleResponse');

      // When we get the item for the given url, with the spy callback
      requestManager.getItemFromUrl(stubUrl, MOCK_LOGGER, stubCallback);

      // Then the mock request module should have been passed a callback
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
