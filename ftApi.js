var notificationsModule	= require('./lib/getContentItemsNotification.js'),
	contentModule		= require('./lib/getContentApiContent.js'),
	apiUtils			= require('./lib/apiUtils.js');

exports.notifications	= notificationsModule;
exports.content			= contentModule;
exports.utils			= apiUtils;