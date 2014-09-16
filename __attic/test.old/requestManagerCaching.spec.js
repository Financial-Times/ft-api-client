'use strict';

  /* DEPENDENCIES */
  var loadModule = require('./utils/module-loader.js').loadModule;

  var MOCK_LOGGER = {
    log: jasmine.createSpy(),
    logRequestError:  jasmine.createSpy(),
    logRequestSuccess:  jasmine.createSpy(),
    logTempRequestFailure: function () {},
    logRequestRetryFailure: function () {}
  };


describe('Request Manager Cache', function () {


  it('makes a request if it doesn\'t exist in cache',
  function () {
    var mockRequest = jasmine.createSpy('request');
    var mockCacheGet = jasmine.createSpy('cache get').andReturn(false);
    // Given a request manager with config such that ten requests are allowed
    var requestManagerContext = loadModule('lib/requestManager.js', {
      '../config/general.json': { maxConcurrentRequests: 10 },
      request: mockRequest,
      'ttl-lru-cache': function() {return { get: mockCacheGet };},
    });
    var requestManager = new requestManagerContext.RequestManager();
    var req = { url: 'http://www.google.com',
      notifyInProgress: jasmine.createSpy(),
      notifyCompleted: jasmine.createSpy(),
      logger: MOCK_LOGGER 
    };

    expect(requestManager.requestsInProgress.length).toEqual(0);

    // And an request queue with two requests in
    requestManager.makeRequest(req);
    // expect(mockCacheGet).toHaveBeenCalledWith('http://www.google.com');
    expect(mockRequest).toHaveBeenCalled();
    //the in progress queue will be cleared later once the request comes back
    expect(requestManager.requestsInProgress.length).toEqual(1);

  });



  it('doesnt make request if it exists in cache',
  function () {
    var mockRequest = jasmine.createSpy('request');
    var mockCacheGet = jasmine.createSpy('cache get').andReturn(true);
    // Given a request manager with config such that ten requests are allowed
    var requestManagerContext = loadModule('lib/requestManager.js', {
      '../config/general.json': { maxConcurrentRequests: 10 },
      request: mockRequest,
      'ttl-lru-cache': function() {return { get: mockCacheGet };},
    });
    var requestManager = new requestManagerContext.RequestManager();
    var req = { url: 'http://www.google.com',
      notifyInProgress: jasmine.createSpy(),
      notifyCompleted: jasmine.createSpy(),
      logger: MOCK_LOGGER 
    };
    // And an request queue with two requests in
    requestManager.makeRequest(req);
    expect(requestManager.requestsInProgress.length).toEqual(0);
    expect(mockCacheGet).toHaveBeenCalledWith('http://www.google.com');
    expect(mockRequest).not.toHaveBeenCalled();
    expect(req.notifyCompleted).toHaveBeenCalled();
    //since we are returning cached value, must also clear the requests in progress queue
    expect(requestManager.requestsInProgress.length).toEqual(0);

  });


  it('saves a successful request in cache',
  function () {
    var mockRequest = jasmine.createSpy('request');
    var mockCacheSet = jasmine.createSpy('cache set');
    // Given a request manager with config such that ten requests are allowed
    var requestManagerContext = loadModule('lib/requestManager.js', {
      '../config/general.json': { maxConcurrentRequests: 10 },
      request: mockRequest,
      'ttl-lru-cache': function() {return { set: mockCacheSet };},
      './responseResolver.js': {
        getErrorFor: jasmine.createSpy().andReturn(null),
        getItemFor: jasmine.createSpy().andReturn('item')
      }
    });
    var requestManager = new requestManagerContext.RequestManager();
    var req = { url: 'http://www.google.com',
      notifyInProgress: jasmine.createSpy(),
      notifyCompleted: jasmine.createSpy(),
      logger: MOCK_LOGGER
    };
    var res = {
      headers: {
        'cache-control': 's-maxage=234, max-age=1000'
      }
    };

    requestManager.requestsInProgress.push(req);
    // And an request queue with two requests in
    expect(requestManager.requestsInProgress.length).toEqual(1);

    requestManager.handleResponse(req, null, res, 'data');


    expect(requestManager.requestsInProgress.length).toEqual(0);
    expect(mockCacheSet).toHaveBeenCalledWith(
      'http://www.google.com',
      {error: null, item: 'item'}, 
      1000*1000
    );
    expect(req.notifyCompleted).toHaveBeenCalled();

  });

it('uses a default TTL of whatever is in config',
  function () {
    var mockRequest = jasmine.createSpy('request');
    var mockCacheSet = jasmine.createSpy('cache set');
    // Given a request manager with config such that ten requests are allowed
    var requestManagerContext = loadModule('lib/requestManager.js', {
      '../config/general.json': { maxConcurrentRequests: 10, 
            defaultCacheTTLMilliseconds: 6000 },
      request: mockRequest,
      'ttl-lru-cache': function() {return { set: mockCacheSet };},
      './responseResolver.js': {
        getErrorFor: jasmine.createSpy().andReturn(null),
        getItemFor: jasmine.createSpy().andReturn('item')
      }
    });
    var requestManager = new requestManagerContext.RequestManager();
    var req = { url: 'http://www.google.com',
      notifyInProgress: jasmine.createSpy(),
      notifyCompleted: jasmine.createSpy(),
      logger: MOCK_LOGGER 
    };
    var res = {
    };

    requestManager.requestsInProgress.push(req);
    // And an request queue with two requests in
    expect(requestManager.requestsInProgress.length).toEqual(1);

    requestManager.handleResponse(req, null, res, 'data');


    expect(requestManager.requestsInProgress.length).toEqual(0);
    expect(mockCacheSet).toHaveBeenCalledWith(
      'http://www.google.com',
      {error: null, item: 'item'}, 
      6000
    );
    expect(req.notifyCompleted).toHaveBeenCalled();

  });

it('doesn\'t save an erroneous retryable response in cache',
  function () {
    var mockRequest = jasmine.createSpy('request');
    var mockCacheSet = jasmine.createSpy('cache set');
    // Given a request manager with config such that ten requests are allowed
    var requestManagerContext = loadModule('lib/requestManager.js', {
      '../config/general.json': { maxConcurrentRequests: 10 },
      request: mockRequest,
      'ttl-lru-cache': function() {return { set: mockCacheSet };},
      './responseResolver.js': {
        getErrorFor: jasmine.createSpy().andReturn({canRetry: true}),
        getItemFor: jasmine.createSpy().andReturn(null)
      }
    });
    var requestManager = new requestManagerContext.RequestManager();
    var req = { url: 'http://www.google.com',
      notifyInProgress: jasmine.createSpy(),
      notifyCompleted: jasmine.createSpy(),
      logger: MOCK_LOGGER 
    };
    var res = {
      headers: {
        'cache-control': 'max-age=1000, s-maxage=1000, public'
      }
    };

    requestManager.requestsInProgress.push(req);
    // And an request queue with two requests in
    expect(requestManager.requestsInProgress.length).toEqual(1);

    requestManager.handleResponse(req, null, res, 'data');


    expect(requestManager.requestsInProgress.length).toEqual(0);
    expect(mockCacheSet).not.toHaveBeenCalled();
    expect(req.notifyCompleted).toHaveBeenCalled();

  });

it('does save an erroneous non-retryable response in cache',
  function () {
    var mockRequest = jasmine.createSpy('request');
    var mockCacheSet = jasmine.createSpy('cache set');
    // Given a request manager with config such that ten requests are allowed
    var requestManagerContext = loadModule('lib/requestManager.js', {
      '../config/general.json': { maxConcurrentRequests: 10 },
      request: mockRequest,
      'ttl-lru-cache': function() {return { set: mockCacheSet };},
      './responseResolver.js': {
        getErrorFor: jasmine.createSpy().andReturn({canRetry: false}),
        getItemFor: jasmine.createSpy().andReturn(null)
      }
    });
    var requestManager = new requestManagerContext.RequestManager();
    var req = { url: 'http://www.google.com',
      notifyInProgress: jasmine.createSpy(),
      notifyCompleted: jasmine.createSpy(),
      logger: MOCK_LOGGER 
    };
    var res = {
      headers: {
        'cache-control': 'max-age=1000, s-maxage=1000, public'
      }
    };

    requestManager.requestsInProgress.push(req);
    // And an request queue with two requests in
    expect(requestManager.requestsInProgress.length).toEqual(1);

    requestManager.handleResponse(req, null, res, 'data');


    expect(requestManager.requestsInProgress.length).toEqual(0);
    expect(mockCacheSet).toHaveBeenCalled();
    expect(req.notifyCompleted).toHaveBeenCalled();

  });
}); 
