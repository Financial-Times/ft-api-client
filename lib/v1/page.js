'use strict';
var request = require('request');
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api:page');

module.exports = function (path, quantity) {
    
    var pageApiUrl = model.Pages.findByTitle(path);
    var self = this;
    function promiseOfPage () {
        return function (resolve, reject) {
            var endpoint = pageApiUrl.apiUrl + '/main-content';  
            debug('requested %s', endpoint);
            self.request({
                endpoint: endpoint,
                reject: reject,
                cb: function (body) {
                    if (!body.pageItems) {
                        reject('no results found');
                        return;
                    }

                    resolve(body.pageItems.map( function (article) {
                            return new model.Article({ item: article }); // make it look like an normal Content API body
                        })
                    );
                },
                resolve: resolve
            });

        };
    }
    return new Promise(promiseOfPage(path));
};
