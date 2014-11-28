'use strict';
var model   = require('../../models');
var debug   = require('debug')('ft-api-client:api:page');

module.exports = function (path, quantity) {
    
    var pageApiUrl = model.Pages.findByTitle(path);
    var self = this;
    function promiseOfPage () {
        return function (resolve, reject) {
            var endpoint = pageApiUrl.apiUrl + '/main-content';  
            debug('requested %s', endpoint);
            self._request({
                endpoint: endpoint
            })
            .then(function (body) {

                // FIXME: make it so we don't need to do this!
                if (body === undefined) {
                    resolve(undefined);
                } else if (!body.pageItems) {
                    reject('no results found (' + endpoint + ')');
                    return;
                }

                if (quantity) {
                    body.pageItems = body.pageItems.splice(0, quantity);
                }

                resolve({
                    articles: body.pageItems.map( function (article) {
                        return new model.Article({ item: article }); // make it look like an normal Content API body
                    })
                });
            });

        };
    }
    return new Promise(promiseOfPage(path));
};
