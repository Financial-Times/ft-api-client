/* NOTIFICATIONS CALLS
 * These chaps are mixed on to a target object, but can be run independently by setting
 * a path mapper and logger. */
'use strict';

var CONFIG = require('../config/general.json'),
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
  var contentCallsProperty;

  // Ensure we have our injected properties on the mixee
  INJECTED_PROPERTIES.forEach(function (propertyName) {
    if (!mixee[propertyName]) {
      throw new TypeError('Content Calls can only be mixed in to an object with a ' +
        propertyName + ' property.');
    }
  });

  // Then for each of our properties that aren't unmixed, add them
  for (contentCallsProperty in exports) {
    if (exports.hasOwnProperty(contentCallsProperty) &&
      UNMIXED_PROPERTIES.indexOf(contentCallsProperty) === -1) {
      mixee[contentCallsProperty] = exports[contentCallsProperty];
    }
  }
};

exports.getNotificationsUpToSince = function (maxNotifications, sinceDateTime, callback) {
  var notificationsPath =
    this.pathMapper.getNotificationsPathUpToSince(maxNotifications, sinceDateTime);
  this.requestManager.getItemFromUrl(notificationsPath, this.logger, callback);
};

exports.getNotificationsSince = function (sinceDateTime, callback) {
  var that = this,
    errors = [],
    notifications = [];

  function getFirstNotifications () {
    // First call kicks off getting notifications
    that.getNotificationsUpToSince(
      CONFIG.maxNotificationsPerCall, sinceDateTime, handleNotificationsResponse
    );
  }

  function getNextNotifications (url) {
    // Subsequent calls feed the url containing the date and limit back in
    that.requestManager.getItemFromUrl(url, that.logger, handleNotificationsResponse);
  }

  function handleNotificationsResponse (error, item) {
    var nextNotificationsUrl;

    if (error) {
      errors.push(error);
    }

    if(item && item.notifications) {
      notifications = notifications.concat(item.notifications);
    }

    // If our total was the max allowed, then we need to get the next batch
    if (item && item.total === item.limit && item.links[0].rel === 'next') {
      nextNotificationsUrl = that.pathMapper.addApiKeyTo(item.links[0].href);
      getNextNotifications(nextNotificationsUrl);
    }
    else { // Else we got them all or we had a failed call, so we're done (◕‿◕✿)
      callback(errors, notifications);
    }
  }

  getFirstNotifications();
};
