'use strict';

var request = require('request'),
  RequestQueue = require('./RequestQueue.js'),
  responseResolver = require('./responseResolver.js'),
  CONFIG = require('../config/general.json');

/* State put on exports for easier testing */
exports.queuedRequests = [];
exports.requestsInProgress = [];

exports.hasRequestsInProgress = function () {
  return (this.requestsInProgress.length > 0);
};

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
  this.conditionallyDispatchRequests();
};

exports.conditionallyDispatchRequests = function () {
  var newRequestCount,
    queuedRequestCount = this.queuedRequests.length,
    requestCapacity = CONFIG.maxConcurrentRequests - this.requestsInProgress.length,
    newRequest;

  for (newRequestCount = 0;
       newRequestCount < queuedRequestCount && newRequestCount < requestCapacity;
       newRequestCount += 1)
  {
    newRequest = this.queuedRequests.shift();
    this.requestsInProgress.push(newRequest);
    this.makeRequest(newRequest);
  }
};

exports.handleRequestCompleted = function (queuedRequest) {
  var requestIndex;

  // Remove from requests in progress
  requestIndex = this.requestsInProgress.indexOf(queuedRequest);
  this.requestsInProgress.splice(requestIndex, 1);

  if (this.queuedRequests.length > 0) {
    this.conditionallyDispatchRequests();
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

exports.handleResponse = function (requestError, response, data, queuedRequest) {
  var logger = queuedRequest.logger, error, item;

  error = responseResolver.getErrorFor(requestError, response, queuedRequest.url);
  item = responseResolver.getItemFor(requestError, response, data);

  if (error && error.canRetry) {
    this.handleTemporaryFailure(error, item, queuedRequest);
  } else {
    if (error) {
      logger.logRequestError(error, queuedRequest);
    } else {
      logger.logRequestSuccess(queuedRequest);
    }
    queuedRequest.notifyCompleted(error, item);
    this.handleRequestCompleted();
  }
};

exports.handleTemporaryFailure = function (error, item, queuedRequest) {
  var logger = queuedRequest.logger,
    maxRetries = CONFIG.maxRetries;

  if (queuedRequest.retryCount < maxRetries) {
    logger.logTempRequestFailure(queuedRequest);
    this.retryRequest(queuedRequest);
  } else {
    logger.logRequestRetryFailure(queuedRequest);
    queuedRequest.notifyCompleted(error, item);
    this.handleRequestCompleted(queuedRequest);
  }
};

exports.retryRequest = function (queuedRequest) {
  var that = this,
    retryDelayMilliseconds = CONFIG.retryDelayMilliseconds,
    slot;

  queuedRequest.notifyRetrying();
  slot = Math.pow(2, queuedRequest.retryCount) - 1;

  setTimeout(function () {
    that.makeRequest(queuedRequest);
  }, slot * retryDelayMilliseconds);
};
