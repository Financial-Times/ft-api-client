'use strict';
var pageList = require('../data/pagesList.json');
var _ = require('lodash');

function getItemByTitle (title) {
	return _.find(pageList.pages, function (item) {
		if (item.title === title) {
			return item;
		}
	});
}

function getApiUrlbyTitle (title) {
	if(getItemByTitle(title)) {
		return getItemByTitle(title).apiUrl;
	} else {
		return false;
	}
}

module.exports.getItemByTitle = getApiUrlbyTitle;