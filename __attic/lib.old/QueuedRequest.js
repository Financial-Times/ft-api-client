'use strict';

function QueuedRequest (url, completedCallback, logger, parentQueue) {
  this.url = url;
  this.completedCallback = completedCallback;
  this.logger = logger;
  this.parentQueue = parentQueue;

  this.item = null;
  this.error = null;
  this.retryCount = 0;
  this.isComplete = false;
  this.isInProgress = false;
}
module.exports = QueuedRequest;

QueuedRequest.prototype.notifyInProgress = function () {
  this.isInProgress = true;
};

QueuedRequest.prototype.notifyRetrying = function () {
  this.retryCount += 1;
};

QueuedRequest.prototype.notifyCompleted = function (error, item) {
  this.isComplete = true;
  this.isInProgress = false;
  this.error = error;
  this.item = item;
  this.completedCallback(error, item);
  this.parentQueue.notifyRequestCompleted();
};
