'use strict';
  /* DEPENDENCIES */
var moment = require('moment'),
  /* PRIVATE METHODS */
  clone,
  getApiDateStringForDateTime,
  /* CONFIG */
  PATH_CONFIG = require('../config/paths.json'),
  PROTOCOL_PREFIX = 'http://',
  API_KEY_FIRST_PARAM = '?apiKey=',
  API_KEY_PARAM = '&apiKey=',
  FEATURE_FLAG_PARAM_PREFIX = '&feature.',
  SINCE_PARAM = '&since=',
  LIMIT_PARAM = '&limit=';

/* PRIVATE METHODS */
clone = function (object) {
  return JSON.parse(JSON.stringify(object));
};

/* This has to exist because the API handles date strings incorrectly ✌.ʕʘ‿ʘʔ.✌
 * The API needs the time zone to be zulu time, but won't accept '+00:00'. It needs 'Z' */
getApiDateStringForDateTime = function (dateTime) {
  var dateTimeMoment, timeZoneOffsetMinutes;
  dateTimeMoment = moment(dateTime);
  // Add the time zone offset (which is a negative difference, so it's subtraction really)
  timeZoneOffsetMinutes = dateTimeMoment.zone();
  dateTimeMoment.add('minutes', timeZoneOffsetMinutes);
  // And then format with our 'Z' at the end
  return dateTimeMoment.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
};

/* EXPORTS */
function PathMapper (apiKey, features) {
  var featuresParam;
  if (typeof apiKey !== 'string' || apiKey === '') {
    throw new TypeError('The Path Mapper constructor requires an API key, ' +
      'which must be a non-empty string');
  }

  this.apiKey = apiKey;
  featuresParam = '';
  if(Array.isArray(features) && features.length > 0) {
    features.forEach(function(feature) {
      if(typeof feature === 'string') {
        featuresParam += (FEATURE_FLAG_PARAM_PREFIX + 
          encodeURIComponent(feature) + '=on');
      }
    });
  }
  this.features = featuresParam;
  this.paths = clone(PATH_CONFIG); // Each instance gets a fresh copy
}
module.exports = PathMapper;

PathMapper.prototype.getContentPathFor = function (id) {
  var paths = this.paths;
  return PROTOCOL_PREFIX + paths.apiDomain + paths.item + id +
    API_KEY_FIRST_PARAM + this.apiKey + this.features;
};

PathMapper.prototype.getPagePathFor = function (id) {
  var paths = this.paths;
  return PROTOCOL_PREFIX + paths.apiDomain + paths.pages + id +
    API_KEY_FIRST_PARAM + this.apiKey + this.features;
};

PathMapper.prototype.getPageContentPathFor = function (id) {
  var paths = this.paths;
  return PROTOCOL_PREFIX + paths.apiDomain + paths.pages + id +
    paths.pageMainContent + API_KEY_FIRST_PARAM + this.apiKey + this.features;
};

PathMapper.prototype.getPagesPath = function () {
  var paths = this.paths;
  return PROTOCOL_PREFIX + paths.apiDomain + paths.pages +
    API_KEY_FIRST_PARAM + this.apiKey + this.features;
};

PathMapper.prototype.getNotificationsPathUpToSince = function (limit, sinceDateTime) {
  var paths = this.paths,
    sinceString = getApiDateStringForDateTime(sinceDateTime);
  return PROTOCOL_PREFIX + paths.apiDomain + paths.notifications +
    API_KEY_FIRST_PARAM + this.apiKey + this.features + SINCE_PARAM + 
    sinceString + LIMIT_PARAM + limit;
};

PathMapper.prototype.getNotificationsPathUpTo = function (limit) {
  var paths = this.paths;
  return PROTOCOL_PREFIX + paths.apiDomain + paths.notifications +
    API_KEY_FIRST_PARAM + this.apiKey + this.features + LIMIT_PARAM + limit;
};

PathMapper.prototype.addApiKeyTo = function (url) {
  return url + API_KEY_PARAM + this.apiKey; // Not using first param form
};
