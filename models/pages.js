'use strict';
var pageList = require('../data/pagesList.json');
var _ = require('lodash');

module.exports.findByTitle = function (title) {
	return _.find(pageList.pages, function (item) {
		if (item.title === title) {
			return item;
		}
	});
};