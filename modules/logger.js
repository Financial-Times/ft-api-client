  /* CONSTANTS */
var STATUS_MESSAGE_PREFIX,
  MESSAGES_BY_STATUS_CODE;

STATUS_MESSAGE_PREFIX = 'Content API response: STATUS: ';

MESSAGES_BY_STATUS_CODE = {
  200: STATUS_MESSAGE_PREFIX + '200: Success',
  400: STATUS_MESSAGE_PREFIX + '400: The request could not be understood by the ' +
    'server due to malformed syntax',
  401: STATUS_MESSAGE_PREFIX + '401: The request requires user authentication. ' +
    'Typically this means a valid apiKey has not been supplied',
  403: STATUS_MESSAGE_PREFIX + '403: Forbidden',
  404: STATUS_MESSAGE_PREFIX + '404: CAPI does not have this content',
  410: STATUS_MESSAGE_PREFIX + '410: Resource no longer exists',
  429: STATUS_MESSAGE_PREFIX + '429: Too many resuests, slow down!',
  500: STATUS_MESSAGE_PREFIX + '500: Internal server error',
  503: STATUS_MESSAGE_PREFIX + '503: The server is currently unable to handle the ' +
    'request, due to temporary overloading or maintenance of the server'
};

/* EXPORTS */
exports.log = function (argument) {
  console.log(argument);
};

exports.logResponse = function (statusCode) {
  exports.log(MESSAGES_BY_STATUS_CODE[statusCode]); // Defer to log above
};
