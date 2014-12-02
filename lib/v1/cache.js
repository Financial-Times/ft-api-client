'use strict';
var cache = require('lru-cache')({
        max: 5000,
        maxAge: 1000 * 60 * 20
    });

module.exports = cache;