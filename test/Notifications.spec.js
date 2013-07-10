'use strict';

var events = require('events'),
  PathMapper = require('../lib/PathMapper.js'),
  loadModule = require('./utils/module-loader.js').loadModule,
  API_KEY = 'foo',
  notificationsContext = loadModule('lib/Notifications.js'),
  NotificationsModule = notificationsContext.Notifications,
  notifications = new NotificationsModule(API_KEY);

describe('FT API Notifications Module', function () {
  it('exports a constructor for a notifications module instance',
  function () {
    var notificationsInstance;
    // Given an module constructor and a stub api key as above
    // When we invoke it
    notificationsInstance = new NotificationsModule(API_KEY);
    // Then the instance should be a notifications module
    expect(notificationsInstance instanceof NotificationsModule).toBeTruthy();
  });

  it('exports a constructor which throws an error unless an api key is given',
  function () {
    var notificationsInstance;
    // Given the notifications module as above
    // When we call the constructor with no arguments
    // Then it should throw an error
    expect(function () { new NotificationsModule(); }).toThrow();

    // Given an api import as above
    // When we call the constructor with an arbitrary string
    notificationsInstance = new NotificationsModule(API_KEY);
    // Then it should have returned an object
    expect(notificationsInstance).toBeDefined();
    expect(typeof notificationsInstance).toBe('object');
  });

  it('has a pathMapper instantiated from the api key passed',
  function () {
    var newPathMapper, notificationsInstance;
    // Given the module as above and a stub api key,
    // and a new pathmapper made from the api key
    newPathMapper = new PathMapper(API_KEY);
    // When we call the constructor with a stub api key
    notificationsInstance = new NotificationsModule(API_KEY);
    // Then it should have a path mapper property
    expect(notificationsInstance.pathMapper).toBeDefined();
    // And it should be equal to a new path mapper
    expect(notificationsInstance.pathMapper).toEqual(newPathMapper);
  });

  it('is an EventEmitter',
  function () {
    // Given the an instance of the notifications module as above
    // When we have a look at it
    // Then we find it's an event emitter :D
    expect(notifications instanceof events.EventEmitter).toBeTruthy();
  });
});

describe('Notifications API Getter Calls', function () {
  describe('get new CAPI date from url path', function () {
    it('returns undefined if no query params are given', function () {
      var path, capiDate;
      // Given an arbitrary url path with no query params
      path = 'http://www.google.com/#crumblz';
      // When we retrieve the capiDate from the path
      capiDate = notificationsContext.getNewCapiDateFromPath(path);
      // Then it should be undefined
      expect(capiDate).toBeUndefined();
    });

    it('returns undefined if no "since" query param is given', function () {
      var path, capiDate;
      // Given an arbitrary url path with query params but no 'since' param
      path = 'http://www.google.com/?foo=bar&spub=tuppz#crumblz';
      // When we retrieve the capiDate from the path
      capiDate = notificationsContext.getNewCapiDateFromPath(path);
      // Then it should be undefined
      expect(capiDate).toBeUndefined();
    });

    it('returns the since query param string if one is given', function () {
      var path, sinceParam, capiDate;
      // Given a since param
      sinceParam = '08:00_or_something';
      // And an arbitrary url path with query params including the since param
      path = 'http://www.google.com/?since=' + sinceParam + '&foo=bar&spub=tuppz#crumblz';
      // When we retrieve the capiDate from the path
      capiDate = notificationsContext.getNewCapiDateFromPath(path);
      // Then it should be equal to the since param
      expect(capiDate).toEqual(sinceParam);
    });
  });

  describe('create new aggregate response', function () {
    it('creates a new aggregate response from the aggregate response template',
    function () {
      var aggregateResponse;
      // Given the notifications module
      // When we call createAggregateResponseObj
      aggregateResponse = notificationsContext.createAggregateResponseObj();
      // Then it should be equal to the aggregate reponse template
      expect(aggregateResponse).toEqual(notificationsContext.AGGREGATE_RESPONSE_TEMPLATE);
      // But should not be it
      expect(aggregateResponse).toNotBe(notificationsContext.AGGREGATE_RESPONSE_TEMPLATE);
    });
  });
});
