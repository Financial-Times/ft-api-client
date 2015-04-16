'use strict';
var pages   = require('../models/pages');

module.exports = function (pageName) {
		var meta = pageName.indexOf('http') === 0 ? pages.findByUrl(pageName) : pages.findByTitle(pageName);
		if (!meta) {
			throw 'Page ' + pageName + ' does not exist';
		}
		return meta;
};
