'use strict';

var request = require('request'),
  RequestQueue = require('./RequestQueue.js'),
  responseResolver = require('./responseResolver.js'),
  CONFIG = require('../config/general.json'),
  cache = require('memory-cache');

function RequestManager() {
  this.queuedRequests = [];
  this.delay = CONFIG.defaultDelayMilliseconds; // delay time under optimal conditions
  this.requestsInProgress = [];
  this.totalRetries = 0;
  this.poll();
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
    if (this.queuedRequests.length) {
      if(this.requestsInProgress.length < CONFIG.maxConcurrentRequests) {
        this.makeRequest(this.queuedRequests.shift());
      }
    } else {
      this.delay = CONFIG.defaultDelayMilliseconds;
    }
  },

  makeRequest: function(req) {
    req.notifyInProgress();
    this.requestsInProgress.push(req);
    var cached = cache.get(req.url);
    if(cached) {
      this.removeRequestFromInProgress(req);
      this.handleSuccess(cached.error,cached.item, req, true);
    } else {
      request({
        url: req.url,
        json: true
      }, this.handleResponse.bind(this, req));
    }

  },
  removeRequestFromInProgress: function(req) {
      var idx   = this.requestsInProgress.indexOf(req);

      if (idx > -1) {
        this.requestsInProgress.splice(idx, 1);
      }
  },
  handleResponse: function(req, err, res, data) {
      var error = responseResolver.getErrorFor(err, res, req.url),
          item  = responseResolver.getItemFor(err, res, data),
          cacheControl =[],
          ttl = CONFIG.defaultCacheTTL;

      this.removeRequestFromInProgress(req);
      
      if (error) {
        this.handleError(error, item, req);
      } else {
        if(res && res.headers && res.headers['cache-control']) {
          cacheControl = res.headers['cache-control'].match(/max-age=(.*),/) || [];
          ttl = cacheControl.length > 1 ? parseInt(cacheControl[1]) * 1000 : ttl;
        }
        cache.put(req.url, {error: error, item: item}, ttl);
        this.handleSuccess(error, item, req);
      }
    },

  handleSuccess: function(error, item, req, cached) {
    // the requestManager shouldn't tell the request to log itself
    req.logger.logRequestSuccess(req, cached);
    req.notifyCompleted(error, item);
  },

  handleError: function(error, item, req) {
    var logger = req.logger,
      retryDelayMilliseconds = CONFIG.retryDelayMilliseconds;

    if (error.canRetry) {
      if (req.retryCount < CONFIG.maxRetries) {
        this.totalRetries += 1;
        this.delay = Math.sqrt(this.totalRetries) * retryDelayMilliseconds;
        this.queuedRequests.push(req);
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
