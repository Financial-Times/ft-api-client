'use strict';

var loadModule = require('./module-loader.js').loadModule,
  content = loadModule('lib/getContentApiContent.js'),
  contentExports = content.exports;

describe('Content API Calls', function () {
  it('exports getApiContent, getPage, getPageMainContent and getPages calls',
      function () {
    var callNames = [
      'getApiContent',
      'getPage',
      'getPageMainContent',
      'getPages'
    ];

    callNames.forEach(function (callName) {
      expect(contentExports[callName]).toBeDefined();
      expect(typeof contentExports[callName]).toEqual('function');
    });
  });

  // TODO: Cover off each call with tests
  // TODO: Refactor calls be stateless? Consult Richard
});

describe('Content API Paths', function () {
  it('makes the get content path by joining api item path with the item id and api key',
      function () {
    // Given a stub config with an apiItemPath and api key, and an arbitrary id
    var stubConfig = {apiItemPath: 'path/', apiKey: 'key'},
      id = 'id',
      path;

    // When we make the get content path
    path = content.makeGetContentPath(stubConfig, id);

    // Then it's equal to the chaps joined together
    expect(path).toEqual([
      stubConfig.apiItemPath, id, content.API_PARAM, stubConfig.apiKey
    ].join(''));
  });

  it('makes the get page path by joining page path with the item id and api key',
      function () {
    // Given a stub config with a page path and api key, and an arbitrary id
    var stubConfig = {pagePath: 'path/', apiKey: 'key'},
      id = 'id',
      path;

    // When we make the get content path
    path = content.makeGetPagePath(stubConfig, id);

    // Then it's equal to the chaps joined together
    expect(path).toEqual([
      stubConfig.pagePath, id, content.API_PARAM, stubConfig.apiKey
    ].join(''));
  });

  it('makes the get page content path by joining page path with page main content path,' +
      'the item id and api key',
      function () {
    // Given a stub config with a page path, page main content and api key, and an id
    var stubConfig = {pagePath: 'path/', pageMainContent: 'pmc/', apiKey: 'key'},
      id = 'id',
      path;

    // When we make the get content path
    path = content.makeGetPageContentPath(stubConfig, id);

    // Then it's equal to the chaps joined together
    expect(path).toEqual([
      stubConfig.pagePath, id, stubConfig.pageMainContent,
      content.API_PARAM, stubConfig.apiKey
    ].join(''));
  });

  it('makes the get pages path by joining page path with the api key',
      function () {
    // Given a stub config with an apiItemPath and api key
    var stubConfig = {pagePath: 'path/', apiKey: 'key'},
      path;

    // When we make the get content path
    path = content.makeGetPagesPath(stubConfig);

    // Then it's equal to the chaps joined together
    expect(path).toEqual([
      stubConfig.pagePath, content.API_PARAM, stubConfig.apiKey
    ].join(''));
  });
});
