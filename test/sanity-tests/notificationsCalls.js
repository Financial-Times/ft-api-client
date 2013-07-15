'use strict';

var moment = require('moment'),
  FtApi = require('../../FtApi.js');

function handleResponse (error, item) {
  console.log(error);
  console.log(item);
}

(function () {
  var ftApi,
    oneHourAgo = moment().subtract('hours', 1).toDate(),
    twelveHoursAgo = moment().subtract('hours', 12).toDate(),
    oneWeekAgo = moment().subtract('weeks', 1).toDate(),
    apiKey = 'f65958a8e35bd14bc52f268b8b3ab4ad';

  ftApi = new FtApi(apiKey);
  ftApi.setLogLevel(FtApi.LOG_LEVEL_INFO);

  ftApi.getNotificationsSince(oneHourAgo, handleResponse);
  ftApi.getNotificationsSince(twelveHoursAgo, handleResponse);
  ftApi.getNotificationsSince(oneWeekAgo, handleResponse);
})();
