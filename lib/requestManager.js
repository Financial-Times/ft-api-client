'use strict';

var request = require('request');

exports.getItemFromUrl = function (url, logger, callback) {
  var that = this;
  // Request as json, which will put the JSON-parsed response body into 'item'
  request({url: url, json: true}, function (error, response, item) {
    that.handleResponse(error, response, item, logger, callback);
  });
};

exports.handleResponse = function (error, response, item, logger, callback) {
  if (error) {
    logger.log(error, logger.LOG_LEVEL_ERROR);
  } else if (response.statusCode !== 200) {
    logger.logResponse(response.statusCode , logger.LOG_LEVEL_ERROR);
  } else {
    logger.logResponse(response.statusCode , logger.LOG_LEVEL_INFO);
  }

  callback(error, item);
};
