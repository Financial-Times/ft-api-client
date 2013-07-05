'use strict';

var apiUtils = require('../lib/apiUtils.js');

describe('FT Api Utils', function () {
  describe('Merge Config', function () {
    var EMPTY_OBJECT = {},
      POPULATED_OBJECT_A = {
        foo: 'bar',
        baz: 'quux'
      },
      POPULATED_OBJECT_B = {
        corge: 'grault',
        garply: 'waldo'
      },
      clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
      };

    it('changes the first object itself to merge keys on to it, and returns it too',
    function () {
      var firstObject, secondObject, returnedObject;

      // Given an empty first object, and a populated object as above
      firstObject = clone(EMPTY_OBJECT);
      secondObject = clone(POPULATED_OBJECT_A);

      // When we merge the objects
      returnedObject = apiUtils.mergeConfig(firstObject, secondObject);

      // Then should find that the first one has been insidiously molested
      // And is no longer the empty object
      expect(firstObject).toNotEqual(EMPTY_OBJECT);
      // But is equal to the second, populated object
      expect(firstObject).toEqual(POPULATED_OBJECT_A);
      // But is not the second object reference
      expect(firstObject).toNotBe(secondObject);

      // While the second object has been left alone
      expect(secondObject).toEqual(POPULATED_OBJECT_A);

      // And the first object has been returned too
      expect(returnedObject).toBe(firstObject);
    });

    it('merges two empty objects to produce a new empty object',
    function () {
      var firstObject, secondObject, returnedObject;

      // Given two empty objects
      firstObject = clone(EMPTY_OBJECT);
      secondObject = clone(EMPTY_OBJECT);

      // When we merge them together
      returnedObject = apiUtils.mergeConfig(firstObject, secondObject);

      // Then the returned object is also empty, but is not the empty object reference
      expect(returnedObject).toEqual(EMPTY_OBJECT);
      expect(returnedObject).toNotBe(EMPTY_OBJECT);
    });

    it('merges an empty and populated object to have the populated object\'s properties',
    function () {
      var firstObject, secondObject, returnedObject;

      // Given an empty object and a populated object
      firstObject = clone(EMPTY_OBJECT);
      secondObject = clone(POPULATED_OBJECT_A);

      // When we merge them together
      returnedObject = apiUtils.mergeConfig(firstObject, secondObject);

      // Then the returned object is no longer empty
      expect(returnedObject).toNotEqual(EMPTY_OBJECT);
      // But is not the second object
      expect(returnedObject).toNotBe(secondObject);
      // But is equal to the second object
      expect(returnedObject).toEqual(secondObject);
    });

    it('merges two populated objects to have the union of their properties',
    function () {
      var firstObject, secondObject, returnedObject, key;

      // Given a pair of populated objects with different properties
      firstObject = clone(POPULATED_OBJECT_A);
      secondObject = clone(POPULATED_OBJECT_B);
      expect(firstObject).toNotEqual(secondObject);

      // When we merge the objects
      returnedObject = apiUtils.mergeConfig(firstObject, secondObject);

      // Then the returned object should have all the properties of both objects
      for (key in POPULATED_OBJECT_A) {
        if (POPULATED_OBJECT_A.hasOwnProperty(key)) {
          expect(returnedObject[key]).toEqual(POPULATED_OBJECT_A[key]);
        }
      }
      for (key in POPULATED_OBJECT_B) {
        if (POPULATED_OBJECT_B.hasOwnProperty(key)) {
          expect(returnedObject[key]).toEqual(POPULATED_OBJECT_B[key]);
        }
      }
    });

    it('merges populated objects with clashing properties to favour the second object',
    function () {
      var firstObject, secondObject, clashingKeyName, returnedObject,
        firstObjectClashValue, secondObjectClashValue, key;

      // Given a pair of populated objects
      firstObject = clone(POPULATED_OBJECT_A);
      secondObject = clone(POPULATED_OBJECT_B);
      // With a clashing property
      clashingKeyName = 'skrump';
      firstObjectClashValue = 'spubble';
      secondObjectClashValue = 'tupp';
      firstObject[clashingKeyName] = firstObjectClashValue;
      secondObject[clashingKeyName] = secondObjectClashValue;

      // When we merge the objects
      returnedObject = apiUtils.mergeConfig(firstObject, secondObject);

      // Then all the keys from both objects have been added to the returned object
      for (key in POPULATED_OBJECT_A) {
        if (POPULATED_OBJECT_A.hasOwnProperty(key)) {
          expect(returnedObject[key]).toBeDefined();
        }
      }
      for (key in POPULATED_OBJECT_B) {
        if (POPULATED_OBJECT_B.hasOwnProperty(key)) {
          expect(returnedObject[key]).toBeDefined();
        }
      }
      // And the value of the clashing key has been taken from the second object
      expect(returnedObject[clashingKeyName]).toEqual(secondObjectClashValue);
      // And not from the first object
      expect(returnedObject[clashingKeyName]).toNotEqual(firstObjectClashValue);
    });
  });

  describe('Flatten Notifications Response', function () {
    // TODO: Cover off flatten notifications
  });
});
