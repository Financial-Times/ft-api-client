'use strict';

function QueuedRequest (url, completedCallback, parentQueue) {
  this.item = null;
  this.error = null;
  this.isComplete = false;
  this.url = url;
  this.completedCallback = completedCallback;
  this.parentQueue = parentQueue;
}
module.exports = QueuedRequest;

QueuedRequest.prototype.notifyCompleted = function (error, item) {
  this.isComplete = true;
  this.error = error;
  this.item = item;
  this.completedCallback(error, item);
  this.parentQueue.notifyRequestCompleted();
};
