'use strict';
var model   = require('../../models');

module.exports = function (pageName) {
    return new Promise(function (resolve, reject) {
        var meta = model.Pages.findByTitle(pageName);
        if (!meta) {
            reject('Page ' + pageName + ' does not exist');
        }
        resolve(meta);
    });

};
