/*global setTimeout:true, console:true */
'use strict';

  /* DEPENDENCIES */
var http = require('https'),
  apiUtils = require('./apiUtils.js'),

  /* INTERNAL METHODS */
  handleCapiHttpResponse,
  logNon200Response,
  makeGetContentPath,
  makeGetPagePath,
  makeGetPageContentPath,
  makeGetPagesPath,

  /* CONSTANTS */
  GET_CONTENT_CONFIG,
  GET_PAGE_CONFIG,
  GET_PAGE_CONTENT_CONFIG,
  GET_PAGES_CONFIG,
  MESSAGES_BY_STATUS_CODE,
  STATUS_MESSAGE_PREFIX = 'Content API response: STATUS: ',
  API_PARAM = '?apiKey=';

/* PATH CREATORS */
// TODO: Are the api item path or page path user-configurable? If not, we can constantise
// TODO: Will the API key change on a per-instance basis? If not, we could store it.
makeGetContentPath = function (config, id) {
  return config.apiItemPath + id + API_PARAM + config.apiKey;
};

makeGetPagePath = function (config, id) {
  return config.pagePath + id + API_PARAM + config.apiKey;
};

makeGetPageContentPath = function (config, id) {
  return config.pagePath + id + config.pageMainContent + API_PARAM + config.apiKey;
};

makeGetPagesPath = function (config) {
  return config.pagePath + API_PARAM + config.apiKey;
};

/* CONFIG */
GET_CONTENT_CONFIG = {
  makePath: makeGetContentPath,
  eventNameMap: {
    singleItemLoaded: 'itemLoaded',
    allContentLoaded: 'allItemsLoaded'
  }
};

GET_PAGE_CONFIG = {
  makePath: makeGetPagePath,
  eventNameMap: {
    singleItemLoaded: 'pageLoaded',
    allContentLoaded: 'allPagesLoaded'
  }
};

GET_PAGE_CONTENT_CONFIG = {
  makePath: makeGetPageContentPath,
  eventNameMap: {
    singleItemLoaded: 'mainContentLoaded',
    allContentLoaded: 'allMainContentLoaded'
  }
};

GET_PAGES_CONFIG = {
  makePath: makeGetPagesPath,
  eventNameMap: {
    singleItemLoaded: 'pageListLoaded',
    allContentLoaded: 'pageListLoadedComplete'
  }
};

MESSAGES_BY_STATUS_CODE = {
  400: STATUS_MESSAGE_PREFIX + '400: The request could not be understood by the ' +
        'server due to malformed syntax',
  401: STATUS_MESSAGE_PREFIX + '401: The request requires user authentication. ' +
        'Typically this means a valid apiKey has not been supplied',
  403: STATUS_MESSAGE_PREFIX + '403: Forbidden',
  404: STATUS_MESSAGE_PREFIX + '404: CAPI does not have this content',
  410: STATUS_MESSAGE_PREFIX + '410: Resource no longer exists',
  429: STATUS_MESSAGE_PREFIX + '429: Too many resuests, slow down!',
  500: STATUS_MESSAGE_PREFIX + '500: Internal server error',
  503: STATUS_MESSAGE_PREFIX + '503: The server is currently unable to handle the ' +
        'request, due to temporary overloading or maintenance of the server'
};

/* EXPORTS */
// Default configuration data, only the 'apiKey' and 'since' do not have default values
// TODO: Are all of these configurable or should we constantise some and expose others?
exports.config = {
  apiDomain:          'api.ft.com',
  apiItemPath:        '/content/items/v1/',
  pagePath:           '/site/v1/pages/',
  pageMainContent:    '/main-content',
  apiUpdateDelay:     125,
  aggregateResponse:  true
};

// A recursive method for fetching a list of items from the CAPI
// We call recusively for two reasons: We can control the speed of requests and we know
// when they have all finished
exports.getApiContent = function (itemsList, passedConfig) {
  this.config = apiUtils.mergeConfig(this.config, passedConfig);
  this.getApiItem(itemsList, 0, [], GET_CONTENT_CONFIG);
};

// Get an individual page from the CAPI
exports.getPage = function (itemsList, passedConfig) {
  this.config = apiUtils.mergeConfig(this.config, passedConfig);
  this.getApiItem(itemsList, 0, [], GET_PAGE_CONFIG);
};

// Get and individual page from the CAPI
exports.getPageMainContent = function (itemsList, passedConfig) {
  this.config = apiUtils.mergeConfig(this.config, passedConfig);
  this.getApiItem(itemsList, 0, [], GET_PAGE_CONTENT_CONFIG);
};

// Get a list pf pages from the CAPI
exports.getPages = function (passedConfig) {
  this.config = apiUtils.mergeConfig(this.config, passedConfig);
  this.getApiItem([''], 0, [], GET_PAGES_CONFIG);
};

// TODO: Make this module stateless by removing use of per-instance .config in getApiItem
exports.getApiItem = function (itemsList, position, responseData, runtimeCfg) {
  var req,
    options,
    self = this;

  // TODO: This 'if' is too large. Break into functions.
  if (position < itemsList.length) {
    // TODO: Switch for user-configurable logging
    console.log('Item: ', position + 1, ' of ', itemsList.length);

    // Options for the node http request
    options = {
      host: this.config.apiDomain,
      path: runtimeCfg.makePath(this.config, itemsList[position]),
      method: 'GET'
    };

    // TODO: Switch for user-configurable logging
    console.log('Content API request: path: ' + options.path);

    req = http.request(options);

    req.on('response', function (response) {
      var deps = {
        itemsList:     itemsList,
        position:      position,
        self:          self,
        responseData:  responseData,
        config:        self.config,
        runtimeCfg:    runtimeCfg
      };
      handleCapiHttpResponse(response, deps);
    });

    // Catch an error with the request and emit an error event
    req.on('error', function() {
      self.emit('requestError', req);
    });

    // Close the request
    req.end();

  } else {
    // We have finished loading in the data from the content API
    self.emit(runtimeCfg.eventNameMap.allContentLoaded, responseData);
  }
};

/* PRIVATE METHODS */
// TODO: Break 'handle success' and 'handle failure' handlers, which emit events
handleCapiHttpResponse = function (response, deps) {
  var jsonResponse = '',
    itemsList = deps.itemsList,
    self = deps.self,
    position = deps.position,
    responseData = deps.responseData,
    runtimeCfg = deps.runtimeCfg,
    responseItem;

  // TODO: Switch for user-configurable logging
  console.log('Content API response: STATUS: ' + response.statusCode);

  if (response.statusCode === 200) {
    response.setEncoding('utf8');

    // The resonse data will stream in
    response.on('data', function (chunk) {
      jsonResponse += chunk;
    });

    response.on('end', function () {
      // Parse the text response to JSON
      responseItem = JSON.parse(jsonResponse);

      // Emit an event to single the completion of a single request and pass the response
      self.emit(runtimeCfg.eventNameMap.singleItemLoaded, responseItem);

      // Add the response to the list of responses
      if (self.config.aggregateResponse === true) {
        responseData.push(responseItem);
      }

      // Update the counter and start another request
      position += 1;

      // Rate limit the requests to content API
      setTimeout(function () {
        self.getApiItem(itemsList, position, responseData, runtimeCfg);
      }, self.config.apiUpdateDelay);
    });
  } else {
    // Update the counter and start another request
    position += 1;

    // Log the non 200 reponse
    logNon200Response(response.statusCode);

    // Rate limit the requests to content API
    setTimeout(function () {
      self.getApiItem(itemsList, position, responseData, runtimeCfg);
    }, self.config.apiUpdateDelay);
  }
};

// If we did not get a 200 analyse the response code and output a suitable message
// TODO: Change to use configurable api logging to users can control logging
logNon200Response = function (statusCode) {
  console.log(MESSAGES_BY_STATUS_CODE[statusCode]);
};
