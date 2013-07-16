'use strict';

var request = require('request'),
  RequestQueue = require('./RequestQueue.js'),
  CONFIG = require('../config/general.json');

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
  var logger = queuedRequest.logger,
    statusCode = response.statusCode;

  if (error) {
    logger.log(error, logger.LOG_LEVEL_ERROR);
  } else if (statusCode !== 200) {
    logger.logResponse(statusCode, logger.LOG_LEVEL_ERROR);
  } else {
    logger.logResponse(statusCode, logger.LOG_LEVEL_INFO);
  }

  if (statusCode === 429 || statusCode === 503) {
    this.handleTemporaryFailure(error, item, queuedRequest);
  } else {
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
    this.handleRequestCompleted();
  }
};

exports.retryRequest = function (queuedRequest) {
  var that = this,
    retryDelayMilliseconds = CONFIG.retryDelayMilliseconds;

  queuedRequest.notifyRetrying();
  setTimeout(function () {
    that.makeRequest(queuedRequest);
  }, retryDelayMilliseconds);
};
