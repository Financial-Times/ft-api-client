'use strict';
var pages = require('../jobs/pages');
var _ = require('lodash');

module.exports.findByTitle = function (title) {
	return pages.get().filter(function (item) {
		return (item && item.title === title);
	})[0];
};