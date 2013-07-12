'use strict';

var request = require('request'),
  QueuedRequest = require('./QueuedRequest.js'),
  STUB_PARENT_QUEUE = {
    notifyRequestCompleted: function () {}
  };

exports.getItemFromUrl = function (url, logger, callback) {
  var that = this, queuedRequest;
  // TODO: Remove this temporary code after refactor

  queuedRequest = new QueuedRequest(url, callback, logger, STUB_PARENT_QUEUE);

  // Request as json, which will put the JSON-parsed response body into 'item'
  request({url: url, json: true}, function (error, response, item) {
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
};
