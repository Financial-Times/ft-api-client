var CapiError = require('../../models/capi-error');
var debug   = require('debug')('ft-api-client:api:errors');

module.exports =  function (opts) {
    var responseTime = new Date() - opts.requestStart;
    this.emit('ft-api-client:v1:' + opts.method + ':response', responseTime, opts.response);
    var err;
    if (opts.err) {
        err = new CapiError(503, err, opts.endpoint);
        debug('rejected - %s', opts.endpoint);
        this.emit('ft-api-client:v1:' + opts.method + ':response:rejected', err);
        return err;
    }

    if (opts.response.statusCode >= 400) {
        err = opts.body;
        try {
            err = JSON.parse(err);
            err = err.message || err.errors[0].message;
        } catch (e) {
            err = opts.body;
        }
        debug('rejected - %s, %s', opts.endpoint, err);
        err = new CapiError(opts.response.statusCode, err, opts.endpoint);
        this.emit('ft-api-client:v1:' + opts.method + ':response:rejected', err);
        return err;
    }

    try {
        JSON.parse(opts.body);
    } catch (e) {
        err = new CapiError(503, 'error parsing JSON', opts.endpoint);
        debug('rejected - could not parse body response for %s', opts.endpoint);
        this.emit('ft-api-client:v1:' + opts.method + ':response:rejected', err);
        return err;        
    }
};