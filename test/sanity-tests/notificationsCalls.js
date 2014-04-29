'use strict';

var moment = require('moment'),
  FtApi = require('../../FtApi.js');

function handleDone (error, item) {
  console.log('Error:', error);
  console.log('Item:', (item ? 'exists' : item));
  console.log(''); // Line separator
}

(function () {
  var ftApi,
    oneHourAgo = moment().subtract('hours', 1).toDate(),
    twelveHoursAgo = moment().subtract('hours', 12).toDate(),
    oneWeekAgo = moment().subtract('weeks', 1).toDate(),
    apiKey = 'f65958a8e35bd14bc52f268b8b3ab4ad';

  ftApi = new FtApi({apiKey: apiKey, logLevel: FtApi.LOG_LEVEL_INFO});

  ftApi.getNotificationsSince(oneHourAgo, handleDone);
  ftApi.getNotificationsSince(twelveHoursAgo, handleDone);
  ftApi.getNotificationsSince(oneWeekAgo, handleDone);
})();
