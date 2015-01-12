'use strict';

var Poller = require('ft-poller');
var pages = [];



module.exports = {

	get: function() {
		return pages;
	},

	init: function (apiKey) {

		var poller = new Poller({
			url: 'http://api.ft.com/site/v1/pages?apiKey=' + apiKey,
			refreshInterval: 1000 * 60 * 5,
			parseData: function (data) {
				pages = data.pages;
			}
		});

		poller.on('error', function (err) {
			console.error(err);
		});

		poller.start({initialRequest: true});
		this.poller = poller;

		return this;
	}
};

