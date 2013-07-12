/*global setTimeout:true */
'use strict';

  /* DEPENDENCIES */
var http = require('https'),
  util = require('util'),
  events = require('events'),
  PathMapper = require('./PathMapper.js'),
  apiUtils = require('./apiUtils.js'),
  Logger = require('./Logger.js'),
  logger = new Logger(),
  DEFAULT_CONFIG = require('../config/defaults.json'),

  /* INTERNAL METHODS */
  handleCapiHttpResponse,
  handleResponseComplete,
  handleResponseSuccess,
  handleResponseFailure,
  getNextItem,

  /* CONSTANTS */
  GET_CONTENT_CONFIG,
  GET_PAGE_CONFIG,
  GET_PAGE_CONTENT_CONFIG,
  GET_PAGES_CONFIG;

/* EXPORTS */
function Content (apiKey) {
  if (typeof apiKey !== 'string' || apiKey === '') {
    throw new TypeError('The Content API constructor requires an API key, ' +
      'which must be a non-empty string');
  }

  this.config = apiUtils.mergeConfig(DEFAULT_CONFIG, {apiKey: apiKey});
  this.pathMapper = new PathMapper(apiKey);
}
util.inherits(Content, events.EventEmitter);
module.exports = Content;

/* CONFIG */
GET_CONTENT_CONFIG = {
  eventNameMap: {
    singleItemLoaded: 'itemLoaded',
    allContentLoaded: 'allItemsLoaded'
  }
};

GET_PAGE_CONFIG = {
  eventNameMap: {
    singleItemLoaded: 'pageLoaded',
    allContentLoaded: 'allPagesLoaded'
  }
};

GET_PAGE_CONTENT_CONFIG = {
  eventNameMap: {
    singleItemLoaded: 'mainContentLoaded',
    allContentLoaded: 'allMainContentLoaded'
  }
};

GET_PAGES_CONFIG = {
  eventNameMap: {
    singleItemLoaded: 'pageListLoaded',
    allContentLoaded: 'pageListLoadedComplete'
  }
};

// A recursive method for fetching a list of items from the CAPI
// We call recusively for two reasons: We can control the speed of requests and we know
// when they have all finished
Content.prototype.getApiContent = function (itemsList, optionalConfig) {
  var additionalConfig = optionalConfig || {},
    callConfig = apiUtils.mergeConfig(this.config, additionalConfig),
    pathConfig = JSON.parse(JSON.stringify(GET_CONTENT_CONFIG));
  pathConfig.pathMaker = 'getContentPathFor';
  this.getApiItem(itemsList, 0, [], pathConfig, callConfig);
};

// Get an individual page from the CAPI
Content.prototype.getPage = function (itemsList, optionalConfig) {
  var additionalConfig = optionalConfig || {},
    callConfig = apiUtils.mergeConfig(this.config, additionalConfig),
    pathConfig = JSON.parse(JSON.stringify(GET_PAGE_CONFIG));
  pathConfig.pathMaker = 'getPagePathFor';
  this.getApiItem(itemsList, 0, [], pathConfig, callConfig);
};

// Get and individual page from the CAPI
Content.prototype.getPageMainContent = function (itemsList, optionalConfig) {
  var additionalConfig = optionalConfig || {},
    callConfig = apiUtils.mergeConfig(this.config, additionalConfig),
    pathConfig = JSON.parse(JSON.stringify(GET_PAGE_CONTENT_CONFIG));
  pathConfig.pathMaker = 'getPageContentPathFor';
  this.getApiItem(itemsList, 0, [], pathConfig, callConfig);
};

// Get a list pf pages from the CAPI
Content.prototype.getPages = function (optionalConfig) {
  var additionalConfig = optionalConfig || {},
    callConfig = apiUtils.mergeConfig(this.config, additionalConfig),
    pathConfig = JSON.parse(JSON.stringify(GET_PAGES_CONFIG));
  pathConfig.pathMaker = 'getPagesPath';
  this.getApiItem([''], 0, [], pathConfig, callConfig);
};

Content.prototype.getApiItem =
  function (itemsList, position, responseData, runtimeCfg, callConfig) {
  var req,
    options,
    self = this;

  logger.log('Item: ' + (position+1) + ' of ' + itemsList.length, logger.LOG_LEVEL_INFO);

  // Options for the node http request
  options = {
    host: callConfig.apiDomain,
    path: this.pathMapper[runtimeCfg.pathMaker](itemsList[position]),
    method: 'GET'
  };

  logger.log('Content API request: path: ' + options.path, logger.LOG_LEVEL_INFO);

  req = http.request(options);

  req.on('response', function (response) {
    var deps = {
      itemsList:     itemsList,
      position:      position,
      self:          self,
      responseData:  responseData,
      runtimeCfg:    runtimeCfg,
      callConfig:    callConfig
    };
    handleCapiHttpResponse(response, deps);
  });

  // Catch an error with the request and emit an error event
  req.on('error', function() {
    self.emit('requestError', req);
  });

  // Close the request
  req.end();
};

/* PRIVATE METHODS */
handleCapiHttpResponse = function (response, deps) {
  if (response.statusCode === 200) {
    logger.logResponse(response.statusCode, logger.LOG_LEVEL_INFO);
    handleResponseSuccess(response, deps);
  } else {
    logger.logResponse(response.statusCode, logger.LOG_LEVEL_ERROR);
    handleResponseFailure(response, deps);
  }
};

handleResponseSuccess = function (response, deps) {
  var jsonResponse = '',
      self = deps.self,
      responseData = deps.responseData,
      callConfig = deps.callConfig,
      runtimeCfg = deps.runtimeCfg,
      responseItem;

  // The resonse data will stream in
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
    jsonResponse += chunk;
  });

  response.on('end', function () {
    // Parse the text response to JSON
    responseItem = JSON.parse(jsonResponse);

    // Add the response to the list of responses
    if (callConfig.aggregateResponse === true) {
      responseData.push(responseItem);
    }

    // Emit an event to single the completion of a single request and pass the response
    self.emit(runtimeCfg.eventNameMap.singleItemLoaded, responseItem);

    handleResponseComplete(deps);
  });
};

handleResponseFailure = function (response, deps) {
  handleResponseComplete(deps);
};

handleResponseComplete = function (deps) {
  var itemCount = deps.itemsList.length;
  if (deps.position + 1 < itemCount) {
    // If we have more items to go, get next item
    deps.position += 1;
    getNextItem(deps);
  } else {
    // Else emit the all content loaded event
    deps.self.emit(deps.runtimeCfg.eventNameMap.allContentLoaded, deps.responseData);
  }
};

getNextItem = function (deps) {
  var self = deps.self;
  // Rate limit the requests to content API
  setTimeout(function () {
    self.getApiItem(
        deps.itemsList, deps.position, deps.responseData, deps.runtimeCfg, deps.callConfig
    );
  }, deps.callConfig.apiUpdateDelay);
};
