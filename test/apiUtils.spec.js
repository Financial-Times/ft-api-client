'use strict';

var apiUtils = require('../modules/apiUtils.js'),
    clone = function (obj) {
      return JSON.parse(JSON.stringify(obj));
    };

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
      };

    it('gracefully handles being passed null or undefined arguments',
    function () {
      var mergedConfig,
        stubConfig;
      // Given two null arguments
      // When we call merge config
      mergedConfig = apiUtils.mergeConfig(null, null);
      // Then we should get an empty object returned
      expect(mergedConfig).toBeDefined();
      expect(mergedConfig).not.toBeNull();
      expect(typeof mergedConfig).toEqual('object');

      // Given two undefined arguments
      // When we call merge config
      mergedConfig = apiUtils.mergeConfig(undefined, undefined);
      // Then we should get an empty object returned
      expect(mergedConfig).toBeDefined();
      expect(mergedConfig).not.toBeNull();
      expect(typeof mergedConfig).toEqual('object');

      // Given a defined first argument and undefined second argument
      stubConfig = {foo: 'bar'};
      // When we call merge config
      mergedConfig = apiUtils.mergeConfig(stubConfig, undefined);
      // Then we should get an object equal to the stub config
      expect(mergedConfig).toBeDefined();
      expect(mergedConfig).toEqual(stubConfig);

      // Given a undefined first argument and a defined second argument
      stubConfig = {foo: 'bar'};
      // When we call merge config
      mergedConfig = apiUtils.mergeConfig(undefined, stubConfig);
      // Then we should get an object equal to the stub config
      expect(mergedConfig).toBeDefined();
      expect(mergedConfig).toEqual(stubConfig);
    });

    // NB. These negative tests are because the previous version molested the first object
    it('does not change the first object itself, and does not return the first object',
    function () {
      var firstObject, secondObject, returnedObject;

      // Given an empty first object, and a populated object as above
      firstObject = clone(EMPTY_OBJECT);
      secondObject = clone(POPULATED_OBJECT_A);

      // When we merge the objects
      returnedObject = apiUtils.mergeConfig(firstObject, secondObject);

      // Then should find that the first one has NOT been insidiously molested
      // And is still the empty object
      expect(firstObject).toEqual(EMPTY_OBJECT);
      // And is not equal to the second, populated object
      expect(firstObject).toNotEqual(POPULATED_OBJECT_A);

      // And the second object has been left alone too
      expect(secondObject).toEqual(POPULATED_OBJECT_A);

      // And the first object has not been returned
      expect(returnedObject).not.toBe(firstObject);
    });

    it('does not change the second object itself, and does not return the second object',
    function () {
      var firstObject, secondObject, returnedObject;

      // Given an empty first object, and a populated object as above
      firstObject = clone(EMPTY_OBJECT);
      secondObject = clone(POPULATED_OBJECT_A);

      // When we merge the objects
      returnedObject = apiUtils.mergeConfig(firstObject, secondObject);

      // Then should find that the second one has NOT been insidiously molested
      // And is still the populated object
      expect(secondObject).toEqual(POPULATED_OBJECT_A);
      // And is not equal to the first empty object
      expect(secondObject).toNotEqual(EMPTY_OBJECT);

      // And the first object has been left alone too
      expect(firstObject).toEqual(EMPTY_OBJECT);

      // And the second object has not been returned
      expect(returnedObject).not.toBe(secondObject);
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
    it('logs the passed argument',
    function () {
      var sourceList;

      // Given a mock console log and an arbitrary sourceList
      spyOn(console, 'log');
      sourceList = [
        {
          id: 'golly'
        }
      ];

      // When we flatten the sourceList
      apiUtils.flattenNotificationsResponse(sourceList);

      // Then we expect log to have been called on the sourceList
      expect(console.log).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(sourceList);
    });

    it('adds the id of each given item to the returned list',
    function () {
      var sourceList, returnedList;

      // Given a source list of objects with ids
      sourceList = [
        {
          id: 'spoob'
        },
        {
          id: 'hubbleh'
        }
      ];

      // When we flatten the source list
      returnedList = apiUtils.flattenNotificationsResponse(sourceList);

      // Then we should find that the ids only have been plucked
      returnedList.forEach(function (returnedItem, index) {
        expect(returnedItem).toEqual(sourceList[index].id);
      });
    });

    it('adds the data content item id of items without ids to the returned list',
    function () {
      var sourceList, returnedList;

      // Given a source list of objects without ids
      sourceList = [
        {
          id: undefined,
          data: {
            'content-item': {
              id: 'spongboob'
            }
          }
        },
        {
          id: undefined,
          data: {
            'content-item': {
              id: 'squidward'
            }
          }
        }
      ];

      // When we flatten the source list
      returnedList = apiUtils.flattenNotificationsResponse(sourceList);

      // Then we should find that the data content item ids only have been plucked
      returnedList.forEach(function (returnedItem, index) {
        expect(returnedItem).toEqual(sourceList[index].data['content-item'].id);
      });
    });
  });
});
