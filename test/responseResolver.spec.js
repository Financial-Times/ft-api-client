'use strict';

var responseResolver = require('../lib/responseResolver.js');

describe('Response Resolver',
function () {
  describe('get item for response data',
  function () {
    it('returns null if there isn\'t a response with a 200 status code', function () {
      var nullRequestError, nullResponse, non200Response, data, item;

      nullRequestError = null;
      nullResponse = null;
      data = {};

      item = responseResolver.getItemFor(nullRequestError, nullResponse, data);

      expect(item).toBeNull();

      non200Response = {
        statusCode: 201
      };

      item = responseResolver.getItemFor(nullRequestError, non200Response, data);

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
});
