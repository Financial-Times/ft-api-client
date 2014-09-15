'use strict';

var _ = require('underscore'),
  MESSAGES_BY_STATUS_CODE = {
    400: '400: Request syntax was malformed. Please examine the request url.',
    401: '401: Request needs user authentication. Please supply a valid API key.',
    403: '403: Access to the resource was forbidden.',
    404: '404: CAPI does not have this content.',
    410: '410: Resource no longer exists.',
    429: '429: Requests are more rapid than the API key allowance.',
    500: '500: Internal server error.',
    503: '503: Server is currently overloaded or undergoing maintainance.'
  },
  REQUEST_ERROR = {
    message: 'Request Error: {0}. Check the request url.',
    isUserActionable: true,
    canRetry: false
  },
  NO_RESPONSE_ERROR = {
    message: 'The request succeeded, but no response was received.',
    isUserActionable: false,
    canRetry: false
  },
  ERRORS_BY_STATUS_CODE = {
    400: {
      message: MESSAGES_BY_STATUS_CODE[400],
      isUserActionable: true,
      canRetry: false
    },
    401: {
      message: MESSAGES_BY_STATUS_CODE[401],
      isUserActionable: true,
      canRetry: false
    },
    403: {
      message: MESSAGES_BY_STATUS_CODE[403],
      isUserActionable: true,
      canRetry: false
    },
    404: {
      message: MESSAGES_BY_STATUS_CODE[404],
      isUserActionable: false,
      canRetry: false
    },
    410: {
      message: MESSAGES_BY_STATUS_CODE[410],
      isUserActionable: false,
      canRetry: false
    },
    429: {
      message: MESSAGES_BY_STATUS_CODE[429],
      isUserActionable: false,
      canRetry: true
    },
    500: {
      message: MESSAGES_BY_STATUS_CODE[500],
      isUserActionable: false,
      canRetry: true
    },
    503: {
      message: MESSAGES_BY_STATUS_CODE[503],
      isUserActionable: false,
      canRetry: true
    }
  };

exports.getStatusCodeFor = function (response) {
  var statusCode;
  // Disallow no response or non-number status code
  if (response && typeof response.statusCode === 'number') {
    statusCode = response.statusCode;
  } else {
    statusCode = null;
  }
  return statusCode;
};

exports.hasRequestError = function (requestError) {
  return !!requestError;
};

exports.hasResponseError = function (response) {
  var statusCode = this.getStatusCodeFor(response);
  // If the status code is an error code, or if there was no status code, it's an error
  return !!(ERRORS_BY_STATUS_CODE[statusCode] || statusCode === null);
};

exports.getResponseErrorFor = function (response) {
  var statusCode = this.getStatusCodeFor(response),
    responseError;
  if (!statusCode) { // If no status code, we must have had no response
    responseError = NO_RESPONSE_ERROR;
  } else {
    responseError = ERRORS_BY_STATUS_CODE[statusCode];
  }
  return responseError;
};

exports.getItemFor = function (requestError, response, data) {
  var hasRequestError = this.hasRequestError(requestError),
    hasResponseError = this.hasResponseError(response);
  // Give data if and only if there's no request error or response error.
  return (!(hasRequestError || hasResponseError) ? data : null);
};

exports.getErrorFor = function (requestError, response, url) {
  var hasRequestError = this.hasRequestError(requestError),
    hasResponseError = this.hasResponseError(response),
    error;

  // Inverse logic of getItemFor above. Return error if request error or response error.
  if (hasRequestError) { // Request error has precedence over any other error
    error = _.clone(REQUEST_ERROR);
    error.message = error.message.replace('{0}', requestError.code);
    error.url = url;
  } else if (hasResponseError) {
    error = _.clone(this.getResponseErrorFor(response));
    error.url = url;
  } else {
    error = null;
  }

  return error;
};
