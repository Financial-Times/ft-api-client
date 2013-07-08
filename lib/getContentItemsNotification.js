/*global setTimeout:true, console:true */
'use strict';

  /* DEPENDENCIES */
var http = require('https'),
  util = require('util'),
  events = require('events'),
  urlParser = require('url'),
  apiUtils = require('./apiUtils.js'),

  /* PRIVATE METHODS */
  handleResponse,
  handleResponseSuccess,
  handleResponseError,
  handleRequestEnd,
  updateAggregateResponse,
  fetchMoreNotifications,
  createAggregateResponseObj,
  getCapiPath,
  getNewCapiDateFromPath,

  /* CONSTANTS */
  AGGREGATE_RESPONSE_TEMPLATE = {
    totalResults: 0,
    resultsList: []
  },
  SINCE_FIELD_STRING = '?since=',
  LIMIT_FIELD_STRING = '&limit=',
  API_KEY_FIELD_STRING = '&apiKey=';

/* EXPORTS */
function Notifications (apiKey) {
  if (typeof apiKey !== 'string' || apiKey === '') {
    throw new TypeError('The Notifications API constructor requires an API key, ' +
      'which must be a non-empty string');
  }

  // Default configuration data, only the 'apiKey' and 'since' do not have default values
  this.config = {
    apiKey:                 apiKey,
    // The domain for the content api
    apiDomain:              'api.ft.com',
    // The path to retrieve notifications
    itemNotificationsPath:  '/content/notifications/v1/items',
    // The delay in ms between requests, used to throttle the speed node talk to CAPI
    apiUpdateDelay:         125,
    // How many items to return in a single request
    limit:                  200,
    // Aggregate the responses from the CAPI and return at the end of all the requests
    aggregateResponse:      true,
    // If there is an error from the CAPI how long the app will wait before retrying
    errorDelay:             10000
    //apiKey: Must be passed
    //since: Must be passed
  };
}
util.inherits(Notifications, events.EventEmitter);
module.exports = Notifications;

Notifications.prototype.fetchItems = function (passedConfig, aggregateResponse) {
  var options,
    request,
    self = this;

  // Update the config with any new properties passed in
  this.config = apiUtils.mergeConfig(this.config, passedConfig);

  // The first time this method is called 'aggregateResponse' will not have been defined
  if (typeof aggregateResponse === 'undefined') {
    aggregateResponse = createAggregateResponseObj();
  }

  // Options for the node http request
  options = {
    host: this.config.apiDomain,
    path: getCapiPath(this.config),
    method: 'GET'
  };

  // Create a new request
  request = http.request(options);
  console.log(options.path);

  request.on('response', function (response) {
    handleResponse(response, self, aggregateResponse);
  });

  // Catch an error with the request and re-init the app
  request.on('error', function(e) {
    console.log('Error with request:', e);
    self.emit('requestError', e);
  });

  // Close the request
  request.end();
};

handleResponse = function (response, self, aggregateResponse) {
  console.log('Content API response: STATUS: ' + response.statusCode);
  if (response.statusCode === 200) {
    handleResponseSuccess(response, self, aggregateResponse);
  } else if (response.statusCode === 503) {
    handleResponseError(self, aggregateResponse);
  } else {
    self.emit('requestError', response);
  }
};

handleResponseSuccess = function (response, self, aggregateResponse) {
  var textResponse = '';

  // The response data will stream in
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
    textResponse += chunk;
  });

  response.on('end', function () {
    handleRequestEnd(aggregateResponse, self, textResponse);
  });
};

handleResponseError = function (self, aggregateResponse) {
  // There was an error from the CAPI, probably transient
  // try again in a little while
  console.log('Response error, delaying for', self.config.errorDelay/1000, 'seconds');
  setTimeout(function () {
    self.fetchItems(self.config, aggregateResponse);
  }, self.config.errorDelay);
};

handleRequestEnd = function (aggregateResponse, notifObj, textResponse) {
  var jsonResponse = JSON.parse(textResponse),
    notifications = jsonResponse.notifications;

  updateAggregateResponse(aggregateResponse, notifObj, textResponse);

  // Emit a 'notificationsRequestComplete' event so deal with run specific functionality
  notifObj.emit('notificationsRequestComplete', notifications);

  // Make another request if there are still more results to come
  if (notifications.length === notifObj.config.limit) {
    fetchMoreNotifications(aggregateResponse, notifObj, jsonResponse);
  } else {
    // We are finished
    notifObj.emit('notificationsLoadComplete', aggregateResponse);
  }
};

// Create a skeleton response object
createAggregateResponseObj = function () {
  return JSON.parse(JSON.stringify(AGGREGATE_RESPONSE_TEMPLATE));
};

updateAggregateResponse = function (aggregateResponse, notifObj, textResponse) {
  var notifications,
      jsonResponse;

  // Append to the list of results
  jsonResponse = JSON.parse(textResponse);
  notifications = jsonResponse.notifications;

  // Conditionally add the recieved notifications to the aggregated results list
  if (notifObj.config.aggregateResponse === true) {
    aggregateResponse.resultsList = aggregateResponse.resultsList.concat(notifications);
  }

  // Update the total number of results
  aggregateResponse.totalResults += jsonResponse.total;
};

fetchMoreNotifications = function (aggregateResponse, notifObj, jsonResponse) {
  // Update the config with the new date
  notifObj.config.since =
      getNewCapiDateFromPath(jsonResponse.links[0].href);

  // Rate limit the requests to content API
  setTimeout(function () {
    notifObj.fetchItems(notifObj.config, aggregateResponse);
  }, notifObj.config.apiUpdateDelay);
};

// Return a constructed path in the format required by the CAPI
getCapiPath = function (config) {
  var path;
  path = config.itemNotificationsPath + SINCE_FIELD_STRING + config.since +
        LIMIT_FIELD_STRING + config.limit + API_KEY_FIELD_STRING + config.apiKey;
  return path;
};

// Return the date portion of the next URL returned by the CAPI
// Uses the node URL module, handy
getNewCapiDateFromPath = function (path) {
  var parsedUrl = urlParser.parse(path, true);
  return parsedUrl.query.since;
};
