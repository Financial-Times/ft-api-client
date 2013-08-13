'use strict';

var responseResolver = require('../lib/responseResolver.js');

describe('Response Resolver',
function () {
  describe('get item for response data',
  function () {
    it('returns null if there isn\'t a response with an error status code', function () {
      var nullRequestError, nullResponse, errorResponse, data, item;

      nullRequestError = null;
      nullResponse = null;
      data = {};

      item = responseResolver.getItemFor(nullRequestError, nullResponse, data);

      expect(item).toBeNull();

      errorResponse = {
        statusCode: 410
      };

      item = responseResolver.getItemFor(nullRequestError, errorResponse, data);

      expect(item).toBeNull();
    });

    it('returns the data if the a response had a 200 status code', function () {
      var nullRequestError, successResponse, data, item;

      nullRequestError = null;
      successResponse = {
        statusCode: 200
      };
      data = {};

      item = responseResolver.getItemFor(nullRequestError, successResponse, data);

      expect(item).toEqual(data);
    });
  });

  describe('get error for response data',
  function () {
    it('returns null unless there\'s a request error, a falsy response or ' +
      'an error status code',
    function () {
      var error;

      error = responseResolver.getErrorFor(null, {statusCode: 0}, null);
      expect(error).toBeNull();
      error = responseResolver.getErrorFor(null, {statusCode: 200}, null);
      expect(error).toBeNull();

      error = responseResolver.getErrorFor({}, null, null);
      expect(error).not.toBeNull();
      error = responseResolver.getErrorFor(null, {statusCode: 404}, null);
      expect(error).not.toBeNull();
    });

    it('returns errors with a url property that\'s the url given',
    function () {
      var url, error;

      url = 'wugwugwug.foogle.com';
      error = responseResolver.getErrorFor({}, null, url);

      expect(error.url).toBe(url);
    });

    it('returns an object with a message string and isUserActionable and canRetry flags',
    function () {
      var error;

      error = responseResolver.getErrorFor({}, null, null);

      expect(error.message).toBeDefined();
      expect(error.isUserActionable).toBeDefined();
      expect(error.canRetry).toBeDefined();
    });
  });
});
