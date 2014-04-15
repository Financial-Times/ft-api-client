'use strict';
  /* MOCK CONTEXT DEPENDENCIES */
var MOCK_CONTENT_CALLS = {
    mixInTo: jasmine.createSpy()
  },
  MOCK_NOTIFICATIONS_CALLS = {
    mixInTo: jasmine.createSpy()
  },
  CONTEXT_MOCKS = {
    './lib/contentCalls.js': MOCK_CONTENT_CALLS,
    './lib/notificationsCalls.js': MOCK_NOTIFICATIONS_CALLS
  },
  /* THE FT API MODULE */
  loadModule = require('./utils/module-loader.js').loadModule,
  ftApiContext = loadModule('FtApi.js', CONTEXT_MOCKS),
  FtApi = ftApiContext.module.exports,
  /* OTHER MODULES */
  PathMapper = require('../lib/PathMapper.js'),
  Logger = require('../lib/Logger.js');

describe('FT API Client', function () {
  var STUB_API_KEY = 'foo',
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
      apiInstance = new FtApi(STUB_API_KEY);
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
      apiInstance = new FtApi(STUB_API_KEY);
      // Then it should have returned an object
      expect(apiInstance).toBeDefined();
      expect(typeof apiInstance).toBe('object');
    });

    it('exports a constructor which has an optional log level argument',
    function () {
      var apiInstance;
      // Given an api import as above
      // When we call the constructor without the optional log level arg
      // Then the log level is still set
      apiInstance = new FtApi(STUB_API_KEY);
      expect(apiInstance.getLogLevel()).toBeDefined();

      // Given an api import as above
      // When we call the constructor with an optional log level arg
      apiInstance = new FtApi(STUB_API_KEY, FtApi.LOG_LEVEL_INFO);
      // Then the log level should have been set to the one given
      expect(apiInstance.getLogLevel()).toBeDefined();
      expect(apiInstance.getLogLevel()).toEqual(FtApi.LOG_LEVEL_INFO);
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
    var apiInstance = new FtApi(STUB_API_KEY);

    it('has a pathMapper property, which is a new pathMapper with the passed API key',
    function (){
      var newPathMapper;
      // Given an api instance created from the shared STUB_API_KEY as above
      // And a new path mapper created from the same key
      newPathMapper = new PathMapper(STUB_API_KEY);
      // When we inspect the api instance
      // Then we expect the pathmapper equal to the new path mapper with the same key
      expect(apiInstance.pathMapper).toBeDefined();
      expect(apiInstance.pathMapper).toEqual(newPathMapper);
    });

    it('has a logger property, which is a new logger instance',
    function (){
      var newLogger = new Logger();
      expect(apiInstance.logger).toBeDefined();
      // Then it should be a new logger
      expect(apiInstance.logger).toEqual(newLogger);
    });

    it('has a request manager property, which is the singleton request manager',
    function () {
	var anotherApiInstance = new FtApi(STUB_API_KEY);

      expect(apiInstance.requestManager).toBeDefined();
      // the request manager instance should be same for each instance of the client
      expect(apiInstance.requestManager).toBe(anotherApiInstance.requestManager);
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

    it('mixes in the content calls methods by calling contentCalls mixInTo',
    function () {
      var contentCalls, apiInstance;
      // Given a mock content calls object passed into the context as above
      contentCalls = MOCK_CONTENT_CALLS;
      // And a spy on content calls mixInTo as above
      // When we create a new api instance
      apiInstance = new FtApi(STUB_API_KEY);
      // Then we expect content calls mixinTo to have been called on the instance itself
      expect(contentCalls.mixInTo).toHaveBeenCalled();
      expect(contentCalls.mixInTo).toHaveBeenCalledWith(apiInstance);
    });

    it('mixes in the notifications calls methods by calling notificationsCalls mixInTo',
    function () {
      var notificationsCalls, apiInstance;
      // Given a mock notifications calls object passed into the context as above
      notificationsCalls = MOCK_NOTIFICATIONS_CALLS;
      // And a spy on notifications calls mixInTo as above
      // When we create a new api instance
      apiInstance = new FtApi(STUB_API_KEY);
      // Then we expect content calls mixinTo to have been called on the instance itself
      expect(notificationsCalls.mixInTo).toHaveBeenCalled();
      expect(notificationsCalls.mixInTo).toHaveBeenCalledWith(apiInstance);
    });
  });
});
