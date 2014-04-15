'use strict';

var request = require('request'),
  RequestQueue = require('./RequestQueue.js'),
  responseResolver = require('./responseResolver.js'),
  CONFIG = require('../config/general.json');

function RequestManager() {
  this.queuedRequests = [];
  this.delay = 1; // delay time under optimal conditions TODO Get from config
  this.requestsInProgress = [];

  setTimeout(this.poll.bind(this), this.delay);
}

RequestManager.prototype = {
  hasRequestsInProgress: function() {
    return this.requestsInProgress > 0;
  },

  getItemFromUrl: function(url, logger, callback) {
    var requestQueue = new RequestQueue();
    requestQueue.addRequest(url, logger, callback);
    this.addToQueuedRequests(requestQueue);
  },

  getItemsFromUrls: function(urls, logger, itemCallback, doneCallback) {
    var requestQueue = new RequestQueue(doneCallback);
    urls.forEach(function (url) { // Add each url to the queue as a request
      requestQueue.addRequest(url, logger, itemCallback);
    });
    this.addToQueuedRequests(requestQueue);
  },

  addToQueuedRequests: function(requestQueue) {
    this.queuedRequests = this.queuedRequests.concat(requestQueue.queue);
  },

  poll: function() {
    this.dispatch();
    setTimeout(this.poll.bind(this), this.delay);
  },

  dispatch: function() {
    if (this.queuedRequests.length && 
		this.requestsInProgress.length < CONFIG.maxConcurrentRequests) {
      this.makeRequest(this.queuedRequests.shift());
    }
  },

  makeRequest: function(req) {
    req.notifyInProgress();
    this.requestsInProgress.push(req);

    request({
      url: req.url,
      json: true
    }, this.handleResponse.bind(this, req));
  },

  handleResponse: function(req, err, res, data) {
      var idx   = this.requestsInProgress.indexOf(req),
          error = responseResolver.getErrorFor(err, res, req.url),
          item  = responseResolver.getItemFor(err, res, data);

      if (idx > -1) {
        this.requestsInProgress.splice(idx, 1);
      }

      if (error) {
        this.handleError(error, item, req);
      } else {
        this.handleSuccess(error, item, req);
      }
    },

  handleSuccess: function(error, item, req) {
    // the requestManager shouldn't tell the request to log itself
    req.logger.logRequestSuccess(req);
    req.notifyCompleted(error, item);
  },

  handleError: function(error, item, req) {
    var logger = req.logger,
      retryDelayMilliseconds = CONFIG.retryDelayMilliseconds;

    if (error.canRetry) {
      if (req.retryCount < CONFIG.maxRetries) {
        this.delay = Math.pow(2, req.retryCount) * retryDelayMilliseconds;
        this.queuedRequests.unshift(req);
        req.notifyRetrying();
        logger.logTempRequestFailure(req);
      } else {
        logger.logRequestRetryFailure(req);
        req.notifyCompleted(error, item);
      }
    } else {
      logger.logRequestError(error, req);
      req.notifyCompleted(error, item);
    }

  }
};

module.exports = RequestManager;
