'use strict';

var loadModule = require('./utils/module-loader.js').loadModule,
  pathMapperContext = loadModule('lib/PathMapper.js'),
  PathMapper = pathMapperContext.PathMapper,
  STUB_API_KEY = 'foo';

describe('FT API Path Mapper', function () {
  var pathMapper = new PathMapper(STUB_API_KEY);

  describe('FT API Path Mapper Module', function () {
    it('exports a constructor which returns a pathmapper instance',
    function () {
      var pathMapper;
      // Given a pathmapper constructor
      // When we invoke it
      pathMapper = new PathMapper(STUB_API_KEY);
      // Then the instance should be a pathmapper
      expect(pathMapper.constructor).toBe(PathMapper);
    });

    it('exports a constructor which throws an error unless an api key is given',
    function () {
      var pathMapper;
      // Given an api import as above
      // When we call the constructor with no arguments
      // Then it should throw an error
      expect(function () { new PathMapper(); }).toThrow();

      // Given an api import as above
      // When we call the constructor with a stub api key as above
      pathMapper = new PathMapper(STUB_API_KEY);
      // Then it should have returned an object
      expect(pathMapper).toBeDefined();
      expect(typeof pathMapper).toBe('object');
    });
  });

  describe('FT API Path Mapper Instance', function () {
    var STUB_ITEM_ID = 'stub_id';

    it('has a paths property, loaded from the constant path config',
    function () {
      var pathMapper;
      // Given the path mapper module's context (so we can get its vars)
      // When we create a new pathmapper instance
      pathMapper = new PathMapper(STUB_API_KEY);
      // Then we should find it has a paths property
      expect(pathMapper.paths).toBeDefined();
      // And it's equal to the path config in the context
      expect(pathMapper.paths).toEqual(pathMapperContext.PATH_CONFIG);
      // But is not the same object as the path config
      expect(pathMapper.paths).not.toBe(pathMapperContext.PATH_CONFIG);
    });

    it('has an api key property, set by the constructor',
    function () {
      var apiKey, pathMapper;
      // Given a particular api key
      apiKey = 'mazing api key';
      // When we create a new pathmapper instance
      pathMapper = new PathMapper(apiKey);
      // Then we should find it has an apikey property
      expect(pathMapper.apiKey).toBeDefined();
      // And it's equal to the passed api key
      expect(pathMapper.apiKey).toEqual(apiKey);
    });

    it('has a getContentPathFor id method, which returns the join of a protocol, ' +
      'instance domain, instance api item path, item id, and instance api key param',
    function () {
      var itemId, contentPath;
      // Given a pathMapper instance with a stub api key as above, and an item id
      itemId = STUB_ITEM_ID;
      // When we get the content path for the item
      contentPath = pathMapper.getContentPathFor(itemId);
      // Then it should be equal to the join of all of these chappies
      expect(contentPath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.item,
        itemId,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey
      ].join(''));
    });

    it('has a getPagePathFor id method, which returns the join of protocol, instance ' +
      'domain, instance page path, item id, and instance api key param',
    function () {
      var itemId, pagePath;
      // Given a pathMapper instance with a stub api key as above, and an item id
      itemId = STUB_ITEM_ID;
      // When we get the page path for the item
      pagePath = pathMapper.getPagePathFor(itemId);
      // Then it should be equal to the join of all of these chappies
      expect(pagePath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.pages,
        itemId,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey
      ].join(''));
    });

    it('has a getPageContentPathFor id method, which returns the join of protocol,' +
      ' domain, instance page path, item id, instance page main content path and ' +
      'instance api key param',
    function () {
      var itemId, pageContentPath;
      // Given a pathMapper instance with a stub api key as above, and an item id
      itemId = STUB_ITEM_ID;
      // When we get the page content path for the item
      pageContentPath = pathMapper.getPageContentPathFor(itemId);
      // Then it should be equal to the join of all of these chappies
      expect(pageContentPath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.pages,
        itemId,
        pathMapper.paths.pageMainContent,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey
      ].join(''));
    });

    it('has a getPagesPath method, which returns the join of protocol, ' +
      'instance domain, instance page path and instance api key param',
    function () {
      var pagesPath;
      // Given a pathMapper instance as above
      // When we get the pages path
      pagesPath = pathMapper.getPagesPath();
      // Then it should be equal to the join of all of these chappies
      expect(pagesPath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.pages,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey
      ].join(''));
    });

    it('has a getNotificationsPathUpToSince method, which returns the join of ' +
      'protocol, instance domain, instance notifications path, api param, since param ' +
      'using the api date format and limit param',
    function () {
      var dateTime, limit, apiDateTimeString, notificationsPath;
      // Given a pathMapper instance as above, and an arbitrary dateTime and limit count
      dateTime = new Date();
      limit = 696969;
      // And an api version of the dateTime string
      apiDateTimeString = pathMapperContext.getApiDateStringForDateTime(dateTime);

      // When we get the notifications path
      notificationsPath = pathMapper.getNotificationsPathUpToSince(limit, dateTime);

      // Then it's all these chaps joined together
      expect(notificationsPath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.notifications,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey,
        pathMapperContext.SINCE_PARAM,
        apiDateTimeString,
        pathMapperContext.LIMIT_PARAM,
        limit
      ].join(''));
    });

    it('has an add api key to url method, which appends the api key param to the url',
    function () {
      var passedUrl, pathWithApiKey;
      // Given a pathMapper instance as above, and an arbitrary url to add the api key to
      passedUrl = 'http://api.ft.com/v1/notifications?limit=200';

      // When we get the notifications path
      pathWithApiKey = pathMapper.addApiKeyTo(passedUrl);

      // Then it's all these chaps joined together
      expect(pathWithApiKey).toEqual([
        passedUrl,
        pathMapperContext.API_KEY_PARAM, // Note it's not the first param
        pathMapper.apiKey
      ].join(''));
    });
  });

  describe('API paths with feature flags enabled', function() {
    var STUB_ITEM_ID = 'stub_id';

    it('appends any feature flags to the url',
    function () {
      var itemId, contentPath;
      pathMapper = new PathMapper(STUB_API_KEY, ['blogposts', 'other_feature']);
      // Given a pathMapper instance with a stub api key as above, and an item id
      itemId = STUB_ITEM_ID;
      // When we get the content path for the item
      contentPath = pathMapper.getContentPathFor(itemId);
      // Then it should be equal to the join of all of these chappies
      expect(contentPath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.item,
        itemId,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey,
        pathMapperContext.FEATURE_FLAG_PARAM_PREFIX,
        'blogposts=on',
        pathMapperContext.FEATURE_FLAG_PARAM_PREFIX,
        'other_feature=on',
      ].join(''));
    });


    it('ignores an empty list of features',
    function () {
      var itemId, contentPath;
      pathMapper = new PathMapper(STUB_API_KEY, []);
      // Given a pathMapper instance with a stub api key as above, and an item id
      itemId = STUB_ITEM_ID;
      // When we get the content path for the item
      contentPath = pathMapper.getContentPathFor(itemId);
      // Then it should be equal to the join of all of these chappies
      expect(contentPath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.item,
        itemId,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey
      ].join(''));
    });


    it('ignores features that are not a string',
    function () {
      var itemId, contentPath;
      pathMapper = new PathMapper(STUB_API_KEY, [{}, 'valid_feature', 5]);
      // Given a pathMapper instance with a stub api key as above, and an item id
      itemId = STUB_ITEM_ID;
      // When we get the content path for the item
      contentPath = pathMapper.getContentPathFor(itemId);
      // Then it should be equal to the join of all of these chappies
      expect(contentPath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.item,
        itemId,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey,
        pathMapperContext.FEATURE_FLAG_PARAM_PREFIX,
        'valid_feature=on',
      ].join(''));
    });

    it('encodes special characters in the Feature Flag string',
    function () {
      var itemId, contentPath;
      pathMapper = new PathMapper(STUB_API_KEY, ['f£@tur3&_Some*?']);
      // Given a pathMapper instance with a stub api key as above, and an item id
      itemId = STUB_ITEM_ID;
      // When we get the content path for the item
      contentPath = pathMapper.getContentPathFor(itemId);
      // Then it should be equal to the join of all of these chappies
      expect(contentPath).toEqual([
        pathMapperContext.PROTOCOL_PREFIX,
        pathMapper.paths.apiDomain,
        pathMapper.paths.item,
        itemId,
        pathMapperContext.API_KEY_FIRST_PARAM,
        pathMapper.apiKey,
        pathMapperContext.FEATURE_FLAG_PARAM_PREFIX,
        'f%C2%A3%40tur3%26_Some*%3F=on',
      ].join(''));
    });
  });

  describe('DateTime to date string mapping', function () {
    /* This has to exist because the API handles date strings incorrectly ✌.ʕʘ‿ʘʔ.✌ */
    it('turns a datetime to an iso string in UTC, with a mandatory Z for the time zone',
    function () {
      var now, isoNowString, apiNowString, API_DATE_FORMAT;
      // Given a datetime of now (which may be in BST), an iso string representation
      // of it, and the api date format
      now = new Date();
      isoNowString = now.toISOString();
      API_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
      // When we get the date string mapping for it
      apiNowString = pathMapperContext.getApiDateStringForDateTime(now);
      // The date and time parts should be equal despite any timezone diff
      // (Take the ending 'z' off)
      expect(isoNowString.slice(0, API_DATE_FORMAT.length - 1))
        .toEqual(apiNowString.slice(0, API_DATE_FORMAT.length - 1));
      // And after the date and time parts, it should end with the same string as the end
      // of the date format string
      expect(apiNowString.slice(API_DATE_FORMAT.length - 1))
        .toEqual(API_DATE_FORMAT.slice(API_DATE_FORMAT.length - 1));
    });
  });
});
