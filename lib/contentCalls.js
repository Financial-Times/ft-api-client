/* CONTENT CALLS
 * These chaps are mixed on to a target object, but can be run independently by setting
 * a path mapper and logger. */
'use strict';

var _ = require('underscore'),
  /* CONSTANTS */
  INJECTED_PROPERTIES = [
    'pathMapper',
    'logger',
    'requestManager'
  ],
  UNMIXED_PROPERTIES = [
    'mixInTo',
    'setPathMapper', // For testing calls in isolation
    'setLogger', // For testing calls in isolation
    'setRequestMapper'
  ].concat(INJECTED_PROPERTIES); // Injected properties are not mixed either

/* INJECTED PROPERTIES AND THEIR SETTERS */
exports.pathMapper = null;
exports.logger = null;
exports.requestManager = null;

exports.setPathMapper = function (pathMapper) {
  this.pathMapper = pathMapper;
};

exports.setLogger = function (logger) {
  this.logger = logger;
};

exports.setRequestManager = function (requestManager) {
  this.requestManager = requestManager;
};

/* MIXING IN */
exports.mixInTo = function (mixee) {
  var propertyToMixIn;

  // Ensure we have our injected properties on the mixee
  INJECTED_PROPERTIES.forEach(function (propertyName) {
    if (!mixee[propertyName]) {
      throw new TypeError('Content Calls can only be mixed in to an object with a ' +
        propertyName + ' property.');
    }
  });

  // Then for each of our properties that aren't unmixed, add them
  for (propertyToMixIn in exports) {
    if (exports.hasOwnProperty(propertyToMixIn) &&
      UNMIXED_PROPERTIES.indexOf(propertyToMixIn) === -1) {
      mixee[propertyToMixIn] = exports[propertyToMixIn];
    }
  }
};

/* Note: This module should handle the mapping of call names to urls, and the calling
 * of passed callbacks after requests are completed. */
exports.getItem = function (id, callback) {
  var url = this.pathMapper.getContentPathFor(id);
  this.requestManager.getItemFromUrl(url, this.logger, callback);
};

exports.getPageList = function (callback) {
  var url = this.pathMapper.getPagesPath();
  this.requestManager.getItemFromUrl(url, this.logger, callback);
};

exports.getPage = function (id, callback) {
  var url = this.pathMapper.getPagePathFor(id);
  this.requestManager.getItemFromUrl(url, this.logger, callback);
};

exports.getPageContent = function (id, callback) {
  var url = this.pathMapper.getPageContentPathFor(id);
  this.requestManager.getItemFromUrl(url, this.logger, callback);
};

exports.getItems = function (ids, itemCallback, optionalDoneCallback) {
  var doneCallback, urls;
  doneCallback = optionalDoneCallback || function () {}; // Default to empty function
  urls = _.map(ids, this.pathMapper.getContentPathFor, this.pathMapper);
  this.requestManager.getItemsFromUrls(urls, this.logger, itemCallback, doneCallback);
};

exports.getPages = function (ids, itemCallback, optionalDoneCallback) {
  var doneCallback, urls;
  doneCallback = optionalDoneCallback || function () {}; // Default to empty function
  urls = _.map(ids, this.pathMapper.getPagePathFor, this.pathMapper);
  this.requestManager.getItemsFromUrls(urls, this.logger, itemCallback, doneCallback);
};
