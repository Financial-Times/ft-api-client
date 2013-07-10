'use strict';

var loadModule = require('./utils/module-loader.js').loadModule,
  contentCallsContext = loadModule('lib/contentCalls.js'),
  contentCalls = contentCallsContext.exports;

describe('Content Calls Module', function () {
  describe('general properties and methods', function () {
    afterEach(function () {
      contentCalls.setLogger(null);
      contentCalls.setPathMapper(null);
    });

    it('has a logger property', function () {
      expect(contentCalls.logger).toBeDefined();
    });

    it('has a setter for the logger property', function () {
      var newLogger = {foo: 'bar'};
      // Given a content calls module with a set logger function
      expect(contentCalls.setLogger).toBeDefined();
      expect(typeof contentCalls.setLogger).toEqual('function');
      // Which has a logger which is not the new logger
      expect(contentCalls.logger).not.toEqual(newLogger);
      // When we set the logger to the new logger
      contentCalls.setLogger(newLogger);
      // Then it should have been set to the new logger
      expect(contentCalls.logger).toBe(newLogger);
    });

    it('has a pathMapper property', function () {
      expect(contentCalls.pathMapper).toBeDefined();
    });

    it('has a setter for the pathmapper property', function () {
      var newPathMapper = {foo: 'bar'};
      // Given a content calls module with a set path mapper function
      expect(contentCalls.setPathMapper).toBeDefined();
      expect(typeof contentCalls.setPathMapper).toEqual('function');
      // Which has a pathMapper which is not the new pathMapper
      expect(contentCalls.pathMapper).not.toEqual(newPathMapper);
      // When we set the pathMapper to the new pathMapper
      contentCalls.setPathMapper(newPathMapper);
      // Then it should have been set to the new pathMapper
      expect(contentCalls.pathMapper).toBe(newPathMapper);
    });

    it('has a mixInTo method', function () {
      expect(contentCalls.mixInTo).toBeDefined();
      expect(typeof contentCalls.mixInTo).toEqual('function');
    });

    describe('mixInTo method', function () {
      it('mixes all properties from the module on to the target object, except for ' +
        'those in UNMIXED_PROPERTIES',
      function () {
        var moduleProperties, property, targetObject, originalTargetObject,
          unmixedProperties, originalProperty;

        // Given a list of all properties on the module
        moduleProperties = [];
        for (property in exports) {
          if (exports.hasOwnProperty(property)) {
            moduleProperties.push(property);
          }
        }

        // And the unmixed properties
        unmixedProperties = contentCallsContext.UNMIXED_PROPERTIES;

        // And a target object with the required properties, and a copy before mixing
        targetObject = {foo: 'bar', baz: 'quux', pathMapper: 'tumblz', logger: 'woop'};
        originalTargetObject = JSON.parse(JSON.stringify(targetObject));

        // When we call mixInTo on the target object
        contentCalls.mixInTo(targetObject);

        // Then we should find that all the module properties have been added, except
        // for those which are on UNMIXED_PROPERTIES
        moduleProperties.forEach(function (property) {
          expect(targetObject[property]).toBeDefined();
          expect(unmixedProperties.indexOf(property)).toEqual(-1);
        });

        // And all the target object's original properties should still remain
        for (originalProperty in originalTargetObject) {
          if (originalTargetObject.hasOwnProperty(originalProperty)) {
            expect(targetObject[originalProperty])
              .toEqual(originalTargetObject[originalProperty]);
          }
        }
      });

      it('throws an error if the target object does not have a logger property',
      function () {
        var objectWithoutLogger = {foo: 'bar', pathMapper: 'baz'},
          objectWithLogger = {foo: 'bar', pathMapper: 'baz', logger: 'quux'};
        expect(function () { contentCalls.mixInTo(objectWithoutLogger); }).toThrow();
        expect(function () { contentCalls.mixInTo(objectWithLogger); }).not.toThrow();
      });

      it('throws an error if the target object does not have a pathMapper property',
      function () {
        var objectWithoutPathMapper = {foo: 'bar', logger: 'baz'},
          objectWithPathMapper = {foo: 'bar', logger: 'baz', pathMapper: 'quux'};
        expect(function () { contentCalls.mixInTo(objectWithoutPathMapper); }).toThrow();
        expect(function () { contentCalls.mixInTo(objectWithPathMapper); }).not.toThrow();
      });
    });
  });
});
