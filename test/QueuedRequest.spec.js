'use strict';

var QueuedRequest = require('../lib/QueuedRequest.js');

describe('Queued Request', function () {
  var STUB_URL = 'foo',
    STUB_CALLBACK = function () {},
    STUB_PARENT_QUEUE = {notifyRequestCompleted: function () {}};

  it('has a constructor that sets the queuedRequests url, completed callback and ' +
    'parent queue',
  function () {
    var queuedRequest;
    // Given a stub url, completed callback and parent queue as above
    // When we make a new queued request from these
    queuedRequest = new QueuedRequest(STUB_URL, STUB_CALLBACK, STUB_PARENT_QUEUE);
    // Then the passed properties should have been assigned
    expect(queuedRequest.url).toBe(STUB_URL);
    expect(queuedRequest.completedCallback).toBe(STUB_CALLBACK);
    expect(queuedRequest.parentQueue).toBe(STUB_PARENT_QUEUE);
  });

  it('has a constructor that sets its item, error and isComplete to default values',
  function () {
    var queuedRequest;
    // Given a stub url, completed callback and parent queue as above
    // When we make a new queued request from these
    queuedRequest = new QueuedRequest(STUB_URL, STUB_CALLBACK, STUB_PARENT_QUEUE);
    // Then we should find that the item, error and isComplete properties have been set
    expect(queuedRequest.item).toBeDefined();
    expect(queuedRequest.item).toEqual(null);
    expect(queuedRequest.error).toBeDefined();
    expect(queuedRequest.error).toEqual(null);
    expect(queuedRequest.isComplete).toBeDefined();
    expect(queuedRequest.isComplete).toEqual(false);
  });

  describe('notify request completed method', function () {
    it('calls its completed callback with the passed error and item',
    function () {
      var queuedRequest, completedCallback, stubError, stubItem;
      // Given a queued request, a spy on the completed callback and a stub item and error
      completedCallback = jasmine.createSpy();
      queuedRequest = new QueuedRequest(STUB_URL, completedCallback, STUB_PARENT_QUEUE);
      stubError = {};
      stubItem = {};
      // When we notify the request it's completed
      queuedRequest.notifyCompleted(stubError, stubItem);
      // Then it the callback should have been called with the passed error and item
      expect(completedCallback).toHaveBeenCalled();
      expect(completedCallback).toHaveBeenCalledWith(stubError, stubItem);
    });

    it('calls notifyItemCompleted on its parent queue',
    function () {
      var queuedRequest;
      spyOn(STUB_PARENT_QUEUE, 'notifyRequestCompleted');
      queuedRequest = new QueuedRequest(STUB_URL, STUB_CALLBACK, STUB_PARENT_QUEUE);

      queuedRequest.notifyCompleted({}, {});

      expect(STUB_PARENT_QUEUE.notifyRequestCompleted).toHaveBeenCalled();
    });

    it('sets its own item and error to the passed ones, and marks itself complete',
    function () {
      var queuedRequest, stubError, stubItem;
      // Given a queued request and a stub item and error
      queuedRequest = new QueuedRequest(STUB_URL, STUB_CALLBACK, STUB_PARENT_QUEUE);
      stubError = {};
      stubItem = {};
      // When we notify it's complete
      queuedRequest.notifyCompleted(stubError, stubItem);
      // Then it should have set its error and item to the passed ones
      expect(queuedRequest.error).toBe(stubError);
      expect(queuedRequest.item).toBe(stubItem);
      expect(queuedRequest.isComplete).toBeTruthy();
    });
  });
});
