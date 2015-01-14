'use strict';

var format = require('util').format;

var CapiError = function (statusCode, message, context) {
	this.statusCode = statusCode;
	this.message = message;
	this.context = context;
};


Object.defineProperty(CapiError.prototype, 'toString', {
	value: function () {
		return format('ft-api-client %serror - %s (%s)', this.statusCode ? this.statusCode + ' ' : '', this.message, this.context);
	},
	enumerable: false
});


module.exports = CapiError;
