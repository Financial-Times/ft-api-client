'use strict';

  /* MOCK CONTEXT DEPENDENCIES */
var MOCK_REQUEST = jasmine.createSpy('request'),
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
    logRequestError:  jasmine.createSpy(),
    logRequestSuccess:  jasmine.createSpy(),
    logTempRequestFailure: function () {},
    logRequestRetryFailure: function () {}
  },
  MOCK_QUEUED_REQUEST = {
    logger: MOCK_LOGGER,
    notifyInProgress: jasmine.createSpy(),
    notifyCompleted: jasmine.createSpy(),
    completedCallback: jasmine.createSpy()
  };

describe('Request Manager', function () {
  var requestManagerContext,
    requestManager,
    stubUrl = 'foo',
    stubCallback = function () {};

  beforeEach(function () {
    // Reset each time to clear the internal state
    requestManagerContext = loadModule('lib/requestManager.js', CONTEXT_MOCKS);
    requestManager = new requestManagerContext.RequestManager;
  });

  it('re-makes any requests that temporarily failed',
  function () {
    var mockContext, spyRequest, requestManagerContext, requestManager, stubUrl,
      itemCallback, stubError, temporaryFailureResponse, successResponse, stubItem,
      requestCallback;

    // Given a spy request
    spyRequest = jasmine.createSpy();
    // And a request module with config with max retries set to 1
    mockContext = {
      CONFIG: {
        maxRetries: 1,
        retryDelayMilliseconds: 0
      },
      request: spyRequest
    };
    requestManagerContext = loadModule('lib/requestManager.js', mockContext);
    requestManager = new requestManagerContext.RequestManager;

    // And a stub url and callback
    stubUrl = 'api.ft.com/foo?bar=quux';
    itemCallback = jasmine.createSpy();
    // And a stub error, failed response code, success code and item
    stubError = null;
    temporaryFailureResponse = {statusCode: 429};
    successResponse = {statusCode: 200};
    stubItem = {};

    // When we ask for an item from a url
    requestManager.getItemFromUrl(stubUrl, MOCK_LOGGER, itemCallback);

    // wait for the internal polling
    waits(1);
    runs(function() {
      // Then the request() method should have been called
      expect(spyRequest).toHaveBeenCalled();
      expect(spyRequest.callCount).toEqual(1);
      // But the spy callback hasn't been called
      expect(itemCallback).not.toHaveBeenCalled();

      // When we call the callback passed to the request, with a temporary failure code
      requestCallback = spyRequest.mostRecentCall.args[1];
      expect(typeof requestCallback).toEqual('function');
      requestCallback(stubError, temporaryFailureResponse, stubItem);

      waitsFor(function () {
        return spyRequest.callCount === 2;
      }, 500);

      runs(function () {
        // Then we should find that request has been called again
        expect(spyRequest.callCount).toEqual(2);

        // When we call the callback passed to the request this time
        requestCallback = spyRequest.mostRecentCall.args[1];
        // With a success response
        requestCallback(stubError, successResponse, stubItem);

        // Then the spy callback should have been called with the stub error and item
        expect(itemCallback).toHaveBeenCalled();
        expect(itemCallback).toHaveBeenCalledWith(stubError, stubItem);
      });
    });
  });

  describe('get item from url', function () {
    it('adds a new request queue to queued requests, with a request for the item',
    function () {
      var requestQueue;
      // Given a fresh module instance, and a stub url, logger and callback as above
      // And a spy on add to request queue
      spyOn(requestManager, 'addToQueuedRequests');
      // When we call getItemForUrl for the stubz
      requestManager.getItemFromUrl(stubUrl, MOCK_LOGGER, stubCallback);
      // Then we should find that it added an item to the request queue
      expect(requestManager.addToQueuedRequests).toHaveBeenCalled();
      requestQueue = requestManager.addToQueuedRequests.mostRecentCall.args[0];
      // And that item contained a request
      expect(requestQueue.queue.length).toEqual(1);
      // Which had the given url, logger and callback
      expect(requestQueue.queue[0].url).toEqual(stubUrl);
      expect(requestQueue.queue[0].logger).toEqual(MOCK_LOGGER);
      expect(requestQueue.queue[0].completedCallback).toEqual(stubCallback);
    });
  });

  describe('get items from urls', function () {
    it('adds a new request queue to queued requests, with a request for each passed item',
    function () {
      var stubUrls, itemCallback, doneCallback, requestQueue;

      // Given a fresh module instance
      // And a set of urls, an item callback and a done callback
      stubUrls = ['foo', 'bar'];
      itemCallback = function () {};
      doneCallback = function () {};
      // And a spy on add to request queue
      spyOn(requestManager, 'addToQueuedRequests');

      // When we call getItemsForUrls for the stubz
      requestManager.getItemsFromUrls(stubUrls, MOCK_LOGGER, itemCallback, doneCallback);

      // Then we should find that it added stuff to the request queue
      expect(requestManager.addToQueuedRequests).toHaveBeenCalled();
      requestQueue = requestManager.addToQueuedRequests.mostRecentCall.args[0];
      // And that added queue contained two requests
      expect(requestQueue.queue.length).toEqual(2);
      // Which had the given url, logger and callback
      expect(requestQueue.queue[0].url).toEqual(stubUrls[0]);
      expect(requestQueue.queue[0].logger).toEqual(MOCK_LOGGER);
      expect(requestQueue.queue[0].completedCallback).toEqual(itemCallback);
      expect(requestQueue.queue[1].url).toEqual(stubUrls[1]);
      expect(requestQueue.queue[1].logger).toEqual(MOCK_LOGGER);
      expect(requestQueue.queue[1].completedCallback).toEqual(itemCallback);
      // And the queue's own done callback was the given done callback
      expect(requestQueue.completedCallback).toEqual(doneCallback);
    });
  });

  describe('add to queued requests', function () {
    it('adds the passed request queue\'s requests on to the queue',
    function () {
      var requestQueue;
      requestQueue = new RequestQueue();
      spyOn(requestManager, 'dispatch'); // Spy to stop callthrough
      requestQueue.addRequest('foo', MOCK_LOGGER, function () {});
      requestQueue.addRequest('bar', MOCK_LOGGER, function () {});
      requestManager.addToQueuedRequests(requestQueue);
      expect(requestManager.queuedRequests[0]).toEqual(requestQueue.queue[0]);
      expect(requestManager.queuedRequests[1]).toEqual(requestQueue.queue[1]);
    });

    it('calls dispatch',
    function () {
      var requestQueue;
      // Given a fresh module, such that requests aren't in progress
      expect(requestManager.hasRequestsInProgress()).toBeFalsy();
      // And a request queue with one request
      requestQueue = new RequestQueue();
      requestQueue.addRequest('foo', MOCK_LOGGER, function () {});
      // And a spy on dispatch
      spyOn(requestManager, 'dispatch');
      // When we add it to the queued requests
      expect(requestManager.dispatch).not.toHaveBeenCalled();
      requestManager.addToQueuedRequests(requestQueue);

      waits(1); // wait for internal polling
      runs(function() {
        // Then we expect dispatch to have been called
        expect(requestManager.dispatch).toHaveBeenCalled();
      });
    });
  });

  describe('conditionally dispatch requests', function () {
    function getRequestManagerWithMaxRequests(maxRequestCount) {
      var mockConfig, contextMocks;
      mockConfig = {maxConcurrentRequests: maxRequestCount};
      contextMocks = {
        '../config/general.json': mockConfig,
        request: MOCK_REQUEST
      };
      requestManagerContext = loadModule('lib/requestManager.js', contextMocks);
      return new requestManagerContext.RequestManager();
    }

    it('doesn\'t dispatch any requests if there are the maximum requests already ' +
      'in progress',
    function () {
      // Given a request manager with config such that zero requests are allowed
      requestManager = getRequestManagerWithMaxRequests(0);

      // And a spy on makeRequest
      spyOn(requestManager, 'makeRequest');
      // And a request queue with a mock queued request
      requestManager.queuedRequests.push(MOCK_QUEUED_REQUEST);

      // When we call conditionally dispatch requests
      requestManager.dispatch();
      // Then make request should not have been called
      expect(requestManager.makeRequest).not.toHaveBeenCalled();
    });

    it('doesn\'t dispatch any requests if there are no queued requests to dispatch',
    function () {
      // Given a request manager with config such that ten requests are allowed
      requestManager = getRequestManagerWithMaxRequests(10);
      // And an empty request queue
      expect(requestManager.queuedRequests.length).toEqual(0);
      // And a spy on makeRequest
      spyOn(requestManager, 'makeRequest');

      // When we call conditionally dispatch requests
      requestManager.dispatch();
      // Then make request should not have been called
      expect(requestManager.makeRequest).not.toHaveBeenCalled();
    });

    it('dispatches as many requests as are in the queue if the queue length is less ' +
      'than the remaining request capacity',
    function () {
      // Given a request manager with config such that ten requests are allowed
      var mockRequest = jasmine.createSpy('request');
      var requestManagerContext = loadModule('lib/requestManager.js', {
        '../config/general.json': { maxConcurrentRequests: 10 },
        request: mockRequest
      });
      var requestManager = new requestManagerContext.RequestManager();

      // And an request queue with two requests in
      requestManager.getItemsFromUrls([
        'http://www.google.com',
        'http://www.yahoo.com'
      ], MOCK_LOGGER);

      waits(100); // wait for internal polling
      runs(function() {
        // Then makeRequest should have been called twice
        expect(mockRequest).toHaveBeenCalled();
        expect(mockRequest.callCount).toEqual(2);
      });
    });

    // FIXME
    // this is failing because we are testing the internals of a module, not it's api
    // we shouldn't be mocking any internal functions, but the boundaries of a module
    // i.e. where a module talks to another module
    it('dispatches as many requests as there is capacity for if the queue length is ' +
      'greater than the remaining request capacity',
    function () {
      // Given a request manager with config such that only two requests are allowed
      var mockRequest = jasmine.createSpy('request');
      var requestManagerContext = loadModule('lib/requestManager.js', {
        '../config/general.json': { maxConcurrentRequests: 2 },
        request: mockRequest
      });
      var requestManager = new requestManagerContext.RequestManager();

      // And an request queue with three requests in
      requestManager.getItemsFromUrls([
        'http://www.google.com',
        'http://www.yahoo.com',
        'http://www.ft.com'
      ], MOCK_LOGGER);

      waits(100);
      runs(function() {
        // Then make request should have been called twice
        expect(mockRequest).toHaveBeenCalled();
        expect(mockRequest.callCount).toEqual(2);
      });
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
  });

  describe('handleResponse', function () {
    it('logs the request success to the queued request\'s logger if no error is passed',
    function () {
      var nullError, stubResponse;

      // Given a mock logger in a mock queued request as above, and a null error object
      expect(MOCK_QUEUED_REQUEST.logger).toBe(MOCK_LOGGER);
      nullError = null;
      stubResponse = {statusCode: 200};

      // When we call handle response with the args
      requestManager.handleResponse(
        MOCK_QUEUED_REQUEST, nullError, stubResponse, {}
      );

      // Then the queued request's logger.logRequestSuccess has been called with something
      expect(MOCK_QUEUED_REQUEST.logger.logRequestSuccess).toHaveBeenCalled();
      expect(MOCK_QUEUED_REQUEST.logger.logRequestSuccess.mostRecentCall.args[0])
        .toBeDefined();
    });

    it('logs the request error to the queued request\'s logger if an error is passed',
    function () {
      var stubError, stubResponse;

      // Given a mock logger in a mock queued request as above, and a defined error object
      expect(MOCK_QUEUED_REQUEST.logger).toBe(MOCK_LOGGER);
      stubError = {};
      stubResponse = {statusCode: 200};

      // When we call handle response with the args
      requestManager.handleResponse(
        MOCK_QUEUED_REQUEST, stubError, stubResponse, {}
      );

      // Then the queued request's logger.logRequestError has been called with something
      expect(MOCK_QUEUED_REQUEST.logger.logRequestError).toHaveBeenCalled();
      expect(MOCK_QUEUED_REQUEST.logger.logRequestError.mostRecentCall.args[0])
        .toBeDefined();
    });

    it('tells a successful request it\'s completed, with no error and the data as item',
    function () {
      var nullRequestError, stubData, successResponse;

      // Given a null request error, success response, stub data and a mock queued request
      nullRequestError = null;
      stubData = {baz: 'quux'};
      successResponse = {statusCode: 200};

      // When we call handleResponse
      requestManager.handleResponse(
        MOCK_QUEUED_REQUEST, nullRequestError, successResponse, stubData
      );

      // Then notifycompleted has been called with null error and stub data as the item
      expect(MOCK_QUEUED_REQUEST.notifyCompleted.mostRecentCall.args[0]).toBeNull();
      expect(MOCK_QUEUED_REQUEST.notifyCompleted.mostRecentCall.args[1]).toBe(stubData);
    });

    it('tells an unsuccessful request it\'s completed, with an error and no item',
    function () {
      var requestError, stubData, nullResponse;

      // Given a request error, no response, stub data and a mock queued request
      requestError = {
        code: 'Total epic fail'
      };
      nullResponse = null;
      stubData = {baz: 'quux'};

      // When we call handleResponse
      requestManager.handleResponse(
        MOCK_QUEUED_REQUEST, requestError, nullResponse, stubData
      );

      // Then notifycompleted has been called with an error and null item
      expect(MOCK_QUEUED_REQUEST.notifyCompleted.mostRecentCall.args[0]).toBeDefined();
      expect(MOCK_QUEUED_REQUEST.notifyCompleted.mostRecentCall.args[1]).toBeNull();
    });
  });
});
