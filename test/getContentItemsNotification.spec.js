'use strict';

var loadModule = require('./module-loader.js').loadModule,
    notifications = loadModule('lib/getContentItemsNotification.js');

describe('Notifications API Getter Calls', function () {
  // TODO: Cover fetchItems
  // TODO: Cover handleRequestEnd

  describe('get CAPI path for a given config object', function () {
    it('joins the itemNotificationsPath, since param, limit param and api key',
    function () {
      var config, path;
      // Given a config object with an item notifications path, since, limit and api key
      config = {
        itemNotificationsPath: 'krum',
        since: 'yesterday',
        limit: 25,
        apiKey: 'ABCDEFG123456'
      };

      // When we get the capi path for the given config object
      path = notifications.getCapiPath(config);

      // Then it should equal the join of the itemNotificationspath with the query params
      expect(path).toEqual([
        config.itemNotificationsPath, notifications.SINCE_FIELD_STRING, config.since,
        notifications.LIMIT_FIELD_STRING, config.limit,
        notifications.API_KEY_FIELD_STRING, config.apiKey
      ].join(''));
    });
  });

  describe('get new CAPI date from url path', function () {
    it('returns undefined if no query params are given', function () {
      var path, capiDate;
      // Given an arbitrary url path with no query params
      path = 'http://www.google.com/#crumblz';
      // When we retrieve the capiDate from the path
      capiDate = notifications.getNewCapiDateFromPath(path);
      // Then it should be undefined
      expect(capiDate).toBeUndefined();
    });

    it('returns undefined if no "since" query param is given', function () {
      var path, capiDate;
      // Given an arbitrary url path with query params but no 'since' param
      path = 'http://www.google.com/?foo=bar&spub=tuppz#crumblz';
      // When we retrieve the capiDate from the path
      capiDate = notifications.getNewCapiDateFromPath(path);
      // Then it should be undefined
      expect(capiDate).toBeUndefined();
    });

    it('returns the since query param string if one is given', function () {
      var path, sinceParam, capiDate;
      // Given a since param
      sinceParam = '08:00today_or_something';
      // And an arbitrary url path with query params including the since param
      path = 'http://www.google.com/' + notifications.SINCE_FIELD_STRING + sinceParam +
        '&foo=bar&spub=tuppz#crumblz';
      // When we retrieve the capiDate from the path
      capiDate = notifications.getNewCapiDateFromPath(path);
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
      aggregateResponse = notifications.createAggregateResponseObj();
      // Then it should be equal to the aggregate reponse template
      expect(aggregateResponse).toEqual(notifications.AGGREGATE_RESPONSE_TEMPLATE);
      // But should not be it
      expect(aggregateResponse).toNotBe(notifications.AGGREGATE_RESPONSE_TEMPLATE);
    });
  });
});
