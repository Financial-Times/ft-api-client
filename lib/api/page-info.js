'use strict';
var pages   = require('../models/pages');

module.exports = function (pageName) {
    return new Promise(function (resolve, reject) {
        var meta = pages.findByTitle(pageName);
        if (!meta) {
            reject('Page ' + pageName + ' does not exist');
        }
        resolve(meta);
    });

};
