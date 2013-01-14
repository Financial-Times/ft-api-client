//Imported FT modules
var notificationsModule	= require('./lib/getContentItemsNotification.js'),
	contentModule		= require('./lib/getContentApiContent.js'),
	pagesModule			= require('./lib/getContentApiPages.js'),
	apiUtils			= require('./lib/apiUtils.js');

// Imported Node modules
var	EventEmitter	= require('events').EventEmitter,
	utils			= require('util');


// Define the Class for fetching notifications from the CAPI
var GetChangesFromCapi = function () {};

// Inherit form the event emitter so we can emit custom events, useful for preserving sanity
utils.inherits(GetChangesFromCapi, EventEmitter);

// Default configuration data, only the 'apiKey' and 'since' do not have default values
GetChangesFromCapi.prototype.config = notificationsModule.config;
GetChangesFromCapi.prototype.fetchItems = notificationsModule.fetchItems;



// Define a class for retrieving content items and pages from the CAPI
GetDataFromContentApi = function (passedConfig) {};
// Inherit form the event emitter so we can emit custom events, useful for preserving sanity
utils.inherits(GetDataFromContentApi, EventEmitter);

GetDataFromContentApi.prototype.getApiContent = contentModule.getApiContent;

// Get an individual page from the CAPI
GetDataFromContentApi.prototype.getPage = contentModule.getPage;

// Get and individual page from the CAPI
GetDataFromContentApi.prototype.getPageMainContent = contentModule.getPageMainContent;

// Get a list pf pages from the CAPI
GetDataFromContentApi.prototype.getPages = contentModule.getPages;

// Default configuration data, only the 'apiKey' and 'since' do not have default values
GetDataFromContentApi.prototype.config = contentModule.config;

GetDataFromContentApi.prototype.getApiItem = contentModule.getApiItem;



// Export the modules
exports.notifications	= new GetChangesFromCapi();
exports.content			= new GetDataFromContentApi();
exports.utils			= apiUtils;