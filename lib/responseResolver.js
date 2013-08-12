'use strict';

/* TO BE PULLED IN FOR THE ERROR MAPPING
var MESSAGES_BY_STATUS_CODE = {
    400: '400: Request syntax was malformed. Please examine the request url.',
    401: '401: Request needs user authentication. Please supply a valid API key.',
    403: '403: Access to the resource was forbidden',
    404: '404: Resource not found',
    410: '410: Resource no longer exists',
    429: '429: Requests are more rapid than the API key allowance',
    500: '500: Internal server error',
    503: '503: Server is currently overloaded or undergoing maintainance'
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
*/

exports.getItemFor = function (requestError, response, data) {
  // If we didn't get a 200 back, return a null item
  return (response && response.statusCode === 200 ? data : null);
};
