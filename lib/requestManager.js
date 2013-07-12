'use strict';

var request = require('request'),
  RequestQueue = require('./RequestQueue.js');

/* State put on exports for easier testing */
exports.queuedRequests = [];
exports.hasRequestsInProgress = false;

exports.getItemFromUrl = function (url, logger, callback) {
  var requestQueue = new RequestQueue();
  requestQueue.addRequest(url, logger, callback);
  this.addToQueuedRequests(requestQueue);
};

exports.getItemsFromUrls = function (urls, logger, itemCallback, doneCallback) {
  var requestQueue = new RequestQueue(doneCallback);
  urls.forEach(function (url) { // Add each url to the queue as a request
    requestQueue.addRequest(url, logger, itemCallback);
  });
  this.addToQueuedRequests(requestQueue);
};

/* MANAGING REQUEST QUEUE */
exports.addToQueuedRequests = function (requestQueue) {
  // Add the requests in the queue to our own queued requests
  this.queuedRequests = this.queuedRequests.concat(requestQueue.queue);
  // And if we haven't got request-eating going on, start it
  if (!this.hasRequestsInProgress) {
    this.dispatchNextRequest();
  }
};

exports.dispatchNextRequest = function () {
  var frontRequest = this.queuedRequests.shift();
  this.hasRequestsInProgress = true;
  this.makeRequest(frontRequest);
};

exports.handleRequestCompleted = function () {
  if (this.queuedRequests.length > 0) {
    this.dispatchNextRequest();
  } else {
    this.hasRequestsInProgress = false;
  }
};

/* MAKING AND HANDLING REQUESTS */
exports.makeRequest = function (queuedRequest) {
  var that = this;

  queuedRequest.notifyInProgress();

  request({url: queuedRequest.url, json: true}, function (error, response, item) {
    that.handleResponse(error, response, item, queuedRequest);
  });
};

exports.handleResponse = function (error, response, item, queuedRequest) {
  var logger = queuedRequest.logger;

  if (error) {
    logger.log(error, logger.LOG_LEVEL_ERROR);
  } else if (response.statusCode !== 200) {
    logger.logResponse(response.statusCode , logger.LOG_LEVEL_ERROR);
  } else {
    logger.logResponse(response.statusCode , logger.LOG_LEVEL_INFO);
  }

  queuedRequest.notifyCompleted(error, item);

  this.handleRequestCompleted();
};
