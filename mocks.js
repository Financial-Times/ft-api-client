'use strict';

var responseBuilders = require('./lib/v1/response-builders');

module.exports = {
    search: function (fixture) {
        return function () {
            return Promise.resolve(responseBuilders.search(fixture));
        };
    // },
    // get: function (fixture) {
    //     return function () {
    //         return Promise.resolve(handlers.get({
    //             text: fixture
    //         }));
    //     }
    // },
    // mget: function (fixture) {
    //     return function () {
    //         return Promise.resolve(handlers.mget({
    //             text: fixture
    //         }));
    //     }
    }
};