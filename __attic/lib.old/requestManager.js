'use strict';

var request = require('request'),
  RequestQueue = require('./RequestQueue.js'),
  responseResolver = require('./responseResolver.js'),
  CONFIG = require('../config/general.json'),
  cache = require('ttl-lru-cache')({maxLength: CONFIG.maxCacheSize});

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
      if(cached.error) {
        this.handleError(cached.error,cached.item, req, true);
      } else {
        this.handleSuccess(cached.error,cached.item, req, true);
      }
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
  handleResponse: function(req, err, res, data, cached) {
      var error = responseResolver.getErrorFor(err, res, req.url),
          item  = responseResolver.getItemFor(err, res, data),
          cacheControl =[],
          ttl = CONFIG.defaultCacheTTLMilliseconds;

      this.removeRequestFromInProgress(req);
      
      if(res && res.headers && res.headers['cache-control']) {
        cacheControl = res.headers['cache-control'].match(/max-age=([\d]+)\b/) || [];
        ttl = cacheControl.length > 1 ? parseInt(cacheControl[1]) * 1000 : ttl;
      }
      if(req.url && !(error && error.canRetry)) {
        cache.set(req.url, {error: error, item: item}, ttl);
      }
      if (error) {
        this.handleError(error, item, req);
      } else {

        this.handleSuccess(error, item, req, cached);
      }
    },

  handleSuccess: function(error, item, req, cached) {
    // the requestManager shouldn't tell the request to log itself
    req.logger.logRequestSuccess(req, cached);
    req.notifyCompleted(error, item);
  },

  handleError: function(error, item, req, cached) {
    var logger = req.logger,
      retryDelayMilliseconds = CONFIG.retryDelayMilliseconds;

    if (error.canRetry) {
      if (req.retryCount < CONFIG.maxRetries) {
        this.totalRetries += 1;
        this.delay = Math.sqrt(this.totalRetries) * retryDelayMilliseconds;
        this.queuedRequests.push(req);
        req.notifyRetrying();
        logger.logTempRequestFailure(req, cached, this.delay);
      } else {
        logger.logRequestRetryFailure(req, cached);
        req.notifyCompleted(error, item);
      }
    } else {
      logger.logRequestError(error, req, cached);
      req.notifyCompleted(error, item);
    }

  }
};

module.exports = RequestManager;
