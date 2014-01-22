'use strict';

var request = require('request'),
  RequestQueue = require('./RequestQueue.js'),
  responseResolver = require('./responseResolver.js'),
  CONFIG = require('../config/general.json');

function RequestManager() {
  this.queue = [];
  this.delay = 1; // delay time under optimal conditions
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

  getItemsFromUrl: function(urls, logger, itemCallback, doneCallback) {
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
    if (this.queue.length && this.requestsInProgress.length < this.requestCapacity) {
      this.doRequest(this.queue.shift());
    }
  },

  doRequest: function(req) {
    req.notifyInProgress();
    this.requestsInProgress.push(req);

    request({
      url: req.url,
      json: true
    }, this.handleResponse.bind(this, req));
  },

  handleResponse: function(req, err, res, data) {
      // TODO Remove request from in-progress queue
      if (err) {
        this.handleError(err, res, req);
      } else {
        this.handleSuccess(req);
      }
    },

  handleSuccess: function(req) {
    // the service is okay, so reset timer to optimal conditions
    this.delay = 1;

    // TODO log request
    req.notifyComplete();
  },

  handleError: function(err, res, req) {
    if (res.statusCode == 429) {
        this.delay = 1000; // stop thrashing the service
      } else if (res.statusCode >= 500) {
        this.delay = 125; // TODO Get from config
      }

    if (res.statusCode >= 429 && req.retryCount < CONFIG.maxRetries) {
      // TODO log request
      req.notifyRetrying();
      this.queue.unshift(req); // push to back of queue?
    } else {
      // TODO log request
      req.notifyComplete();
    }
  }
};

module.exports = RequestManager;