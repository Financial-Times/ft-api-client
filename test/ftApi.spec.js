'use strict';

var events = require('events'),
    FtApi = require('../FtApi.js'),
    ContentModule = require('../lib/getContentApiContent.js'),
    NotificationsModule = require('../lib/getContentItemsNotification.js');

describe('FT API Client', function () {
  var API_KEY = 'foo';

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
  });
});
