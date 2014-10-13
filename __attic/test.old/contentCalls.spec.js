'use strict';

var loadModule = require('./utils/module-loader.js').loadModule,
  contentCallsContext = loadModule('lib/contentCalls.js'),
  contentCalls = contentCallsContext.exports;

describe('Content Calls Module', function () {
  describe('general properties and methods', function () {
    afterEach(function () {
      contentCalls.setLogger(null);
      contentCalls.setPathMapper(null);
      contentCalls.setRequestManager(null);
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

    it('has a requestManager property', function () {
      expect(contentCalls.requestManager).toBeDefined();
    });

    it('has a setter for the requestManager property', function () {
      var newRequestManager = {foo: 'bar'};
      // Given a content calls module with a set requestManager function
      expect(contentCalls.setRequestManager).toBeDefined();
      expect(typeof contentCalls.setRequestManager).toEqual('function');
      // Which has a requestManager which is not the new requestManager
      expect(contentCalls.requestManager).not.toEqual(newRequestManager);
      // When we set the requestManager to the new requestManager
      contentCalls.setRequestManager(newRequestManager);
      // Then it should have been set to the new requestManager
      expect(contentCalls.requestManager).toBe(newRequestManager);
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
        targetObject =
          {foo: 'bar', pathMapper: 'tumblz', logger: 'woop', requestManager: 'woo'};
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
        var objectWithoutLogger = {foo: 'bar', pathMapper: 'baz', requestManager: 'woo'},
          objectWithLogger =
          {foo: 'bar', pathMapper: 'baz', requestManager: 'woo', logger: 'quux'};
        expect(function () { contentCalls.mixInTo(objectWithoutLogger); }).toThrow();
        expect(function () { contentCalls.mixInTo(objectWithLogger); }).not.toThrow();
      });

      it('throws an error if the target object does not have a pathMapper property',
      function () {
        var objectWithoutPathMapper = {foo: 'bar', logger: 'baz', requestManager: 'woo'},
          objectWithPathMapper =
            {foo: 'bar', logger: 'baz',  requestManager: 'woo', pathMapper: 'quux'};
        expect(function () { contentCalls.mixInTo(objectWithoutPathMapper); }).toThrow();
        expect(function () { contentCalls.mixInTo(objectWithPathMapper); }).not.toThrow();
      });

      it('throws an error if the target object does not have a request manager property',
        function () {
          var objectWithoutReqMan =
              {foo: 'bar', pathMapper: 'baz', logger: 'baz'},
            objectWithReqMan =
              {foo: 'bar', pathMapper: 'baz', logger: 'quux', requestManager: 'woo'};
          expect(function () { contentCalls.mixInTo(objectWithoutReqMan); }).toThrow();
          expect(function () { contentCalls.mixInTo(objectWithReqMan); }).not.toThrow();
        });
    });
  });

  describe('calls to get items', function () {
    var CALL_NAMES = [
      'getItem',
      'getPageList',
      'getPage',
      'getPageContent'
    ];

    CALL_NAMES.forEach(function (callName) {
      it('has a ' + callName + ' call', function () {
        expect(contentCalls[callName]).toBeDefined();
        expect(typeof contentCalls[callName]).toEqual('function');
      });
    });


    it('allows a null parameter for the single item callback', function() {
      contentCallsContext = loadModule('lib/contentCalls.js', { 'underscore': {
        map: function() {
          return 'blah';}
        }
      });
      contentCalls = contentCallsContext.exports;

      contentCalls.requestManager = {
        getItemsFromUrls: function() {}
      };
      contentCalls.pathMapper = {
        getContentPathFor: function() {}
      };
      contentCalls.logger = 'logger';
      var requestManagerSpy = spyOn(contentCalls.requestManager, 'getItemsFromUrls');
      contentCalls.getItems('some ids', null, function() {

      });

      expect(requestManagerSpy).toHaveBeenCalledWith('blah', 
        'logger', jasmine.any(Function), jasmine.any(Function));
    });

    it('allows a null parameter for the single page callback', function() {
      contentCallsContext = loadModule('lib/contentCalls.js', { 'underscore': {
        map: function() {
          return 'blah';}
        }
      });
      contentCalls = contentCallsContext.exports;

      contentCalls.requestManager = {
        getItemsFromUrls: function() {}
      };
      contentCalls.pathMapper = {
        getPagePathFor: function() {}
      };
      contentCalls.logger = 'logger';
      var requestManagerSpy = spyOn(contentCalls.requestManager, 'getItemsFromUrls');
      contentCalls.getPages('some ids', null, function() {

      });

      expect(requestManagerSpy).toHaveBeenCalledWith('blah', 
        'logger', jasmine.any(Function), jasmine.any(Function));
    });

  });
});
