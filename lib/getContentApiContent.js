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
  API_PARAM = '?apiKey=';

/* PATH CREATORS */
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

/* EXPORTS */
// Default configuration data, only the 'apiKey' and 'since' do not have default values
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

exports.getApiItem = function (itemsList, position, responseData, runtimeCfg) {
  var req,
    options,
    self = this;

  if (position < itemsList.length) {

    console.log('Item: ', position + 1, ' of ', itemsList.length);

    // Options for the node http request
    options = {
      host: this.config.apiDomain,
      path: runtimeCfg.makePath(this.config, itemsList[position]),
      method: 'GET'
    };

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
handleCapiHttpResponse = function (response, deps) {
  var jsonResponse = '',
    itemsList = deps.itemsList,
    self = deps.self,
    position = deps.position,
    responseData = deps.responseData,
    runtimeCfg = deps.runtimeCfg,
    responseItem;

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
logNon200Response = function (statusCode) {
  switch (statusCode) {
  case 404:
    console.log('Content API response: STATUS: ',
      statusCode, 'CAPI does not have this content');
    break;
  case 429:
    console.log('Content API response: STATUS: ',
      statusCode, 'Too many resuests, slow down!');
    break;
  case 500:
    console.log('Content API response: STATUS: ',
      statusCode, 'Internal server error');
    break;
  case 410:
    console.log('Content API response: STATUS: ',
      statusCode, 'Resource no longer exists');
    break;
  case 503:
    console.log('Content API response: STATUS: ',
      statusCode, 'The server is currently unable to handle the request, ' +
        'due to temporary overloading or maintenance of the server');
    break;
  case 403:
    console.log('Content API response: STATUS: ',
      statusCode, 'Forbidden');
    break;
  case 401:
    console.log('Content API response: STATUS: ',
      statusCode, 'The request requires user authentication. Typically this ' +
        'means a valid apiKey has not been supplied');
    break;
  case 400:
    console.log('Content API response: STATUS: ',
      statusCode, 'The request could not be understood by the server due ' +
        'to malformed syntax');
    break;
  }
};
