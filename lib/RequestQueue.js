'use strict';

var _ = require('underscore'),
  QueuedRequest = require('./QueuedRequest.js');

function RequestQueue(optionalCompletedCallback) {
  this.queue = [];
  this.completedCallback = optionalCompletedCallback || null;
}

module.exports = RequestQueue;

RequestQueue.prototype.addRequest = function (url, callback) {
  this.queue.push(new QueuedRequest(url, callback, this));
};

RequestQueue.prototype.hasCompleted = function () {
  // Returns true only if every isComplete is true
  return _.every(_.pluck(this.queue, 'isComplete'), _.identity);
};

RequestQueue.prototype.notifyRequestCompleted = function () {
  var errors, items;

  if (!(this.hasCompleted() && this.completedCallback)) {
    return;
  }

  errors = _.pluck(this.queue, 'error');
  items = _.pluck(this.queue, 'item');

  this.completedCallback(errors, items);
};
