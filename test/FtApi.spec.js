'use strict';

var FtApi = require('../FtApi.js'),
    ContentModule = require('../modules/Content.js'),
    NotificationsModule = require('../modules/Notifications.js');

describe('FT API Client', function () {
  var API_KEY = 'foo',
    LOG_LEVEL_FLAGS = [
      'LOG_LEVEL_NONE',
      'LOG_LEVEL_INFO',
      'LOG_LEVEL_ERROR'
    ];

  describe('FT API Client Module', function () {
    it('exports a constructor which returns an api instance',
    function () {
      var apiInstance;
      // Given an api constructor
      // When we invoke it
      apiInstance = new FtApi(API_KEY);
      // Then the instance should be an FT API
      expect(apiInstance.constructor).toBe(FtApi);
    });

    it('exports a constructor which throws an error unless an api key is given',
    function () {
      var apiInstance;
      // Given an api import as above
      // When we call the constructor with no arguments
      // Then it should throw an error
      expect(function () { new FtApi(); }).toThrow();

      // Given an api import as above
      // When we call the constructor with a stub api key as above
      apiInstance = new FtApi(API_KEY);
      // Then it should have returned an object
      expect(apiInstance).toBeDefined();
      expect(typeof apiInstance).toBe('object');
    });

    it('exports logging level flags',
    function () {
      // Given an ft api
      // When we have a look at it
      // For each log level
      LOG_LEVEL_FLAGS.forEach(function (logLevelFlag) {
        // We should find a corresponding flag on the FtApi
        expect(FtApi[logLevelFlag]).toBeDefined();
      });
    });
  });

  describe('FT API Client Instance', function () {
    var apiInstance = new FtApi(API_KEY);

    it('has a content property which is the content module',
    function() {
      // Given an api instance as above
      // When we inspect its properties
      // Then we should find a content property
      expect(apiInstance.content).toBeDefined();
      // And it should be an instance of the Content module
      expect(apiInstance.content.constructor).toBe(ContentModule);
    });

    it('has a notifications property which is the notifications module',
    function() {
      // Given an api instance as above
      // When we inspect its properties
      // Then we should find a notifications property
      expect(apiInstance.notifications).toBeDefined();
      // And it should be an instance of the Notifications module
      expect(apiInstance.notifications.constructor).toBe(NotificationsModule);
    });

    it('has setLoggingLevel getters and setters',
    function () {
      // Given an api instance as above
      // When we have a look
      // Then we should find getLogLevel and setLogLevel methods
      expect(apiInstance.getLogLevel).toBeDefined();
      expect(apiInstance.setLogLevel).toBeDefined();
      expect(typeof apiInstance.getLogLevel).toEqual('function');
      expect(typeof apiInstance.setLogLevel).toEqual('function');

      // Given each log level flag and an api instance as above
      LOG_LEVEL_FLAGS.forEach(function (logLevelFlag) {
        // When we set the logging level
        apiInstance.setLogLevel(FtApi[logLevelFlag]);
        // Then that same logging level is returned on the getter
        expect(apiInstance.getLogLevel()).toEqual(FtApi[logLevelFlag]);
      });
    });
  });
});
