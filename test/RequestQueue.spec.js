'use strict';

var RequestQueue = require('../lib/RequestQueue.js');

describe('Request Queue', function () {
  var STUB_URL = 'foo',
    STUB_CALLBACK = function () {};

  it('has a constructor that sets an optional completed callback, and sets the queue ' +
  'to a new array',
  function () {
    var requestQueue, stubCompletedCallback;
    // Given butts
    // When we make a new request queue but don't pass a completed callback
    requestQueue = new RequestQueue();
    // Then the completed callback shouldn't be set
    expect(requestQueue.completedCallback).toBeFalsy();
    // And it should have a queue that's a new array
    expect(requestQueue.queue).toEqual([]);

    // Given a stub completed callback
    stubCompletedCallback = function () {};
    // When we make a new request queue, passing the stub callback
    requestQueue = new RequestQueue(stubCompletedCallback);
    // Then the completed callback should have been set
    expect(requestQueue.completedCallback).toBe(stubCompletedCallback);
    // And it should STILL have a queue that's a new array
    expect(requestQueue.queue).toEqual([]);
  });

  describe('add request', function () {
    it('adds a new queued request to its internal queue, with the passed url, ' +
      'callback and a reference to the internal queue',
    function () {
      var requestQueue, queuedRequest;
      // Given a request queue and a stub url and callback as above
      requestQueue = new RequestQueue();
      // Then when we add a new request to the queue
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);
      // Then the queue should now have a queued request
      expect(requestQueue.queue.length).toEqual(1);
      queuedRequest = requestQueue.queue[0];
      // And it should have a url and callback as passed
      expect(queuedRequest.url).toBe(STUB_URL);
      expect(queuedRequest.completedCallback).toBe(STUB_CALLBACK);
    });
  });

  describe('has queue completed', function () {
    var requestQueue;

    beforeEach(function () {
      requestQueue = new RequestQueue();
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);
    });

    it('returns false if no items in the queue have been completed',
    function () {
      expect(requestQueue.hasCompleted()).toEqual(false);
    });

    it('returns false if fewer than all items in the queue have been completed',
    function () {
      requestQueue.queue[0].notifyCompleted({}, {});
      expect(requestQueue.hasCompleted()).toEqual(false);
    });

    it('returns true only if all items in the queue have been completed',
    function () {
      requestQueue.queue[0].notifyCompleted({}, {});
      requestQueue.queue[1].notifyCompleted({}, {});
      expect(requestQueue.hasCompleted()).toEqual(true);
    });
  });

  describe('notify request completed', function () {
    it('doesn\'t call its completed callback if the queue hasn\'t completed',
    function () {
      var requestQueue = new RequestQueue(jasmine.createSpy());
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);
      requestQueue.queue[0].isComplete = true;
      // When we manually call notify request completed
      requestQueue.notifyRequestCompleted();
      expect(requestQueue.completedCallback).not.toHaveBeenCalled();
    });

    it('calls its completed callback if all the queue\'s requests have completed',
    function () {
      var requestQueue, completedCallback;

      completedCallback = jasmine.createSpy();
      requestQueue = new RequestQueue(completedCallback);
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);

      requestQueue.queue[0].isComplete = true;
      requestQueue.queue[1].isComplete = true;

      // When we manually call notify request completed
      requestQueue.notifyRequestCompleted();
      // Then it should have been called
      expect(requestQueue.completedCallback).toHaveBeenCalled();
    });

    it('calls its completed callback with all of its requests\' errors and items',
    function () {
      var requestQueue, errorA, itemA, errorB, itemB, errors, items;
      // Given a request queue with a spy completed callback and two queued requests
      requestQueue = new RequestQueue(jasmine.createSpy());
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);
      requestQueue.addRequest(STUB_URL, STUB_CALLBACK);

      // And the requests have both been notified complete with errors and items
      errorA = {foo: 'bar'};
      itemA = {baz: 'quux'};
      requestQueue.queue[0].notifyCompleted(errorA, itemA);
      errorB = {foo: 'quux'};
      itemB = {baz: 'bar'};

      // When we notify the last request that it's done, calling notifyRequestCompleted
      requestQueue.queue[1].notifyCompleted(errorB, itemB);

      // Then the completed callback should have been called
      errors = [errorA, errorB];
      items = [itemA, itemB];
      expect(requestQueue.completedCallback).toHaveBeenCalled();
      expect(requestQueue.completedCallback).toHaveBeenCalledWith(errors, items);
    });
  });
});
