'use strict';

var QueuedRequest = require('../lib/QueuedRequest.js');

describe('Queued Request', function () {
  var STUB_URL = 'foo',
    STUB_CALLBACK = function () {},
    STUB_PARENT_QUEUE = {notifyRequestCompleted: function () {}},
    STUB_LOGGER = {},
    queuedRequest;

  beforeEach(function () {
    queuedRequest =
      new QueuedRequest(STUB_URL, STUB_CALLBACK, STUB_LOGGER, STUB_PARENT_QUEUE);
  });

  it('has a constructor that sets the queuedRequests url, completed callback, logger ' +
    'and parent queue',
  function () {
    // Given a stub url, completed callback and parent queue as above
    // When we make a new queued request from these as above
    // Then the passed properties should have been assigned
    expect(queuedRequest.url).toBe(STUB_URL);
    expect(queuedRequest.completedCallback).toBe(STUB_CALLBACK);
    expect(queuedRequest.logger).toBe(STUB_LOGGER);
    expect(queuedRequest.parentQueue).toBe(STUB_PARENT_QUEUE);
  });

  it('has a constructor that sets its item, error, retryCount, isComplete and ' +
    'isInProgress to default values',
  function () {
    // Given a stub url, completed callback and parent queue as above
    // When we make a new queued request from these as above
    // Then we should find that the item, error and isComplete properties have been set
    expect(queuedRequest.item).toBeDefined();
    expect(queuedRequest.item).toEqual(null);
    expect(queuedRequest.error).toBeDefined();
    expect(queuedRequest.error).toEqual(null);
    expect(queuedRequest.retryCount).toBeDefined();
    expect(queuedRequest.retryCount).toEqual(0);
    expect(queuedRequest.isComplete).toBeDefined();
    expect(queuedRequest.isComplete).toEqual(false);
    expect(queuedRequest.isInProgress).toBeDefined();
    expect(queuedRequest.isInProgress).toEqual(false);
  });

  it('has a notify retrying method that increments retry count',
  function () {
    // Given a queued request as above, with a retry count of zero
    expect(queuedRequest.retryCount).toEqual(0);
    // When we notify it that it's being retried
    queuedRequest.notifyRetrying();
    // Then the retry count should have been incremented
    expect(queuedRequest.retryCount).toEqual(1);
  });

  describe('notify request in progress', function () {
    it('sets the request\'s in progress flag to true', function () {
      expect(queuedRequest.isInProgress).toBeFalsy();
      queuedRequest.notifyInProgress();
      expect(queuedRequest.isInProgress).toEqual(true);
    });
  });

  describe('notify request completed method', function () {
    it('calls its completed callback with the passed error and item',
    function () {
      var queuedRequest, completedCallback, stubError, stubItem;
      // Given a queued request, a spy on the completed callback and a stub item and error
      completedCallback = jasmine.createSpy();
      queuedRequest =
        new QueuedRequest(STUB_URL, completedCallback, STUB_LOGGER, STUB_PARENT_QUEUE);
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
      // May fail because of reference to parent queue
      spyOn(STUB_PARENT_QUEUE, 'notifyRequestCompleted');
      queuedRequest.notifyCompleted({}, {});
      expect(STUB_PARENT_QUEUE.notifyRequestCompleted).toHaveBeenCalled();
    });

    it('sets its own item and error to the passed ones, marks itself complete and ' +
      'no longer in progress',
    function () {
      var stubError, stubItem;
      // Given a queued request and a stub item and error
      stubError = {};
      stubItem = {};
      // When we notify it's complete
      queuedRequest.notifyCompleted(stubError, stubItem);
      // Then it should have set its error and item to the passed ones
      expect(queuedRequest.error).toBe(stubError);
      expect(queuedRequest.item).toBe(stubItem);
      // And be complete and no longer in progress
      expect(queuedRequest.isComplete).toBeTruthy();
      expect(queuedRequest.isInProgress).toBeFalsy();
    });
  });
});
