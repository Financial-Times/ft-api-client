'use strict';

var loadModule = require('./module-loader.js').loadModule,
  content = loadModule('lib/getContentApiContent.js'),
  contentExports = content.exports;

describe('Content API getter calls', function () {
  var CALL_NAMES = [
    'getApiContent',
    'getPage',
    'getPageMainContent',
    'getPages'
  ],
  CONFIG_NAMES = [
    'GET_CONTENT_CONFIG',
    'GET_PAGE_CONFIG',
    'GET_PAGE_CONTENT_CONFIG',
    'GET_PAGES_CONFIG'
  ];

  afterEach(function () {
    // Reset the content objects
    content = loadModule('lib/getContentApiContent.js');
    contentExports = content.exports;
  });

  it('exports ' + CALL_NAMES.join(', ') + ' calls',
      function () {
    CALL_NAMES.forEach(function (callName) {
      expect(contentExports[callName]).toBeDefined();
      expect(typeof contentExports[callName]).toEqual('function');
    });
  });

  CALL_NAMES.forEach(function (callName, index) {
    it('implements ' + callName + ' by calling getApiItem with ' + CONFIG_NAMES[index],
    function () {
      // Given a spy on getApiItem
      spyOn(contentExports, 'getApiItem');

      // When we make the call with an arbitrary itemsList and config object
      contentExports[callName]({}, {});

      // Then getApiItem should have been called with the corresponding call config
      expect(contentExports.getApiItem).toHaveBeenCalled();
      expect(contentExports.getApiItem.mostRecentCall.args[3])
          .toEqual(content[CONFIG_NAMES[index]]);
    });

    // TODO: Refactor calls be stateless? Consult Richard
    it(callName + ' merges passed config with the content object\'s own config',
    function () {
      var callConfig, configKey;

      // Given a fresh content item with default config
      expect(contentExports.config).toBeDefined();
      expect(typeof contentExports.config).toEqual('object');
      // And arbitrary call config
      callConfig = {
        a: 'a',
        b: 'b'
      };
      // TODO: Make getContentApiContent an Event Emitter internally so it doesn't die!
      // And a spy on 'getApiItem' to stop it finding it's not an Event Emitter and dying
      spyOn(contentExports, 'getApiItem');

      // When make the call with the call config passed
      if (callName === 'getPages') {
        contentExports[callName](callConfig);
      } else {
        contentExports[callName]({}, callConfig);
      }

      // Then we expect that the callConfig has been merged on to the content's own config
      expect(contentExports.config).toBeDefined();
      expect(typeof contentExports.config).toEqual('object');
      for (configKey in callConfig) {
        if (callConfig.hasOwnProperty(configKey)) {
          expect(contentExports.config[configKey]).toEqual(callConfig[configKey]);
        }
      }
    });
  });
});

describe('Content API Paths', function () {
  it('makes the get content path by joining api item path with the item id and api key',
      function () {
    // Given a stub config with an apiItemPath and api key, and an arbitrary id
    var stubConfig = {apiItemPath: 'path/', apiKey: 'key'},
      id = 'id',
      path;

    // When we make the get content path
    path = content.makeGetContentPath(stubConfig, id);

    // Then it's equal to the chaps joined together
    expect(path).toEqual([
      stubConfig.apiItemPath, id, content.API_PARAM, stubConfig.apiKey
    ].join(''));
  });

  it('makes the get page path by joining page path with the item id and api key',
      function () {
    // Given a stub config with a page path and api key, and an arbitrary id
    var stubConfig = {pagePath: 'path/', apiKey: 'key'},
      id = 'id',
      path;

    // When we make the get content path
    path = content.makeGetPagePath(stubConfig, id);

    // Then it's equal to the chaps joined together
    expect(path).toEqual([
      stubConfig.pagePath, id, content.API_PARAM, stubConfig.apiKey
    ].join(''));
  });

  it('makes the get page content path by joining page path with page main content path,' +
      'the item id and api key',
      function () {
    // Given a stub config with a page path, page main content and api key, and an id
    var stubConfig = {pagePath: 'path/', pageMainContent: 'pmc/', apiKey: 'key'},
      id = 'id',
      path;

    // When we make the get content path
    path = content.makeGetPageContentPath(stubConfig, id);

    // Then it's equal to the chaps joined together
    expect(path).toEqual([
      stubConfig.pagePath, id, stubConfig.pageMainContent,
      content.API_PARAM, stubConfig.apiKey
    ].join(''));
  });

  it('makes the get pages path by joining page path with the api key',
      function () {
    // Given a stub config with an apiItemPath and api key
    var stubConfig = {pagePath: 'path/', apiKey: 'key'},
      path;

    // When we make the get content path
    path = content.makeGetPagesPath(stubConfig);

    // Then it's equal to the chaps joined together
    expect(path).toEqual([
      stubConfig.pagePath, content.API_PARAM, stubConfig.apiKey
    ].join(''));
  });
});

describe('Content API logging', function () {
  it('logs the corresponding status message for each code',
  function () {
    var statusCode, messageForCode, messagesByCode;
    // Given a set of messages for each status code
    messagesByCode = content.MESSAGES_BY_STATUS_CODE;
    // And a mock console log
    spyOn(console, 'log');

    // For each status code and corresponding message
    for (statusCode in messagesByCode) {
      if (messagesByCode.hasOwnProperty(statusCode)) {
        messageForCode = messagesByCode[statusCode];

        // When we call logResponse
        content.logResponse(statusCode);

        // Then console.log should have been called with the status message for the code
        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(messageForCode);
      }
    }
  });
});
