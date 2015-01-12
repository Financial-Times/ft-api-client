var CapiError = require('../models/capi-error');
var debug   = require('debug')('ft-api-client:api:errors');


var determineEndpoint = function (url) {
    return url.indexOf('api.ft.com/content/items') > -1 ? 'items' :
            url.indexOf('api.ft.com/content/search') > -1 ? 'search' :
            url.indexOf('api.ft.com/site/v1/pages') > -1 ? 'pages' :
            url.indexOf(this.config.elasticSearchUri) ? 'elasticSearch' : 'unknown';
}




module.exports =  function (opts) {

    var endpoint = determineEndpoint.call(this, opts.url);
    var responseTime = new Date() - opts.requestStart;

    this.emit('ft-api-client:v1:' + endpoint + ':response', responseTime, opts.response);

    var err;

    if (opts.err) {
        err = new CapiError(503, err, opts.url);
        debug('rejected - %s', opts.url);
        this.emit('ft-api-client:v1:' + endpoint + ':response:rejected', err);
        opts.reject(err);
        return;
    }

    if (opts.response.statusCode >= 400) {
        err = opts.body;
        try {
            err = JSON.parse(err);
            err = err.message || err.errors[0].message;
        } catch (e) {
            err = opts.body;
        }
        debug('rejected - %s, %s', opts.url, err);
        err = new CapiError(opts.response.statusCode, err, opts.url);
        this.emit('ft-api-client:v1:' + endpoint + ':response:rejected', err);
        opts.reject(err);
        return;
    }

    try {
        var body = JSON.parse(opts.body);
        this.emit('ft-api-client:v1:' + endpoint + ':response:resolved', err);
        opts.resolve(body);
    } catch (e) {
        err = new CapiError(503, 'error parsing JSON', opts.url);
        debug('rejected - could not parse body response for %s', opts.url);
        this.emit('ft-api-client:v1:' + endpoint + ':response:rejected', err);
        opts.reject(err);
        return;
    }
};