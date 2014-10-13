'use strict';

var _ = require('underscore'),
  QueuedRequest = require('./QueuedRequest.js'),
  getValueArrayOrNull;

function RequestQueue(optionalCompletedCallback) {
  this.queue = [];
  this.completedCallback = optionalCompletedCallback || null;
}

module.exports = RequestQueue;

RequestQueue.prototype.addRequest = function (url, logger, callback) {
  // Pass reference to self as the parent queue of the queued request
  this.queue.push(new QueuedRequest(url, callback, logger, this));
};

RequestQueue.prototype.hasCompleted = function () {
  // Returns true only if every isComplete is true
  return _.every(_.pluck(this.queue, 'isComplete'));
};

RequestQueue.prototype.isInProgress = function () {
  // Returns true if any isInProgress flag is true
  return _.some(_.pluck(this.queue, 'isInProgress'));
};

getValueArrayOrNull = function (items, valueName) {
  var itemValues = _.pluck(items, valueName),
    nonNullValues = _.filter(itemValues, function (value) {
      return (value !== null);
    });
  return (nonNullValues.length > 0 ? nonNullValues : null);
};

RequestQueue.prototype.notifyRequestCompleted = function () {
  var errors, items;

  if (!this.hasCompleted() || !this.completedCallback) {
    return;
  }

  errors = getValueArrayOrNull(this.queue, 'error');
  items = getValueArrayOrNull(this.queue, 'item');

  this.completedCallback(errors, items);
};
