/*global console:true*/
'use strict';

var FtApi = require('../../FtApi.js'),
    moment = require('moment');

function getDateStringForHoursAgo(hoursAgo) {
  var nowMoment = moment().utc(),
      momentHoursAgo = nowMoment.subtract('hours', hoursAgo);
  return momentHoursAgo.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
}

// Fetch a list of the latest notifications form the CAPI
function getNotifications () {
  // The 'apiKey' and the 'since' date are required.
  var config = {
      since: getDateStringForHoursAgo(24) // Required to be in Z-ended ISO format
    },
    ftApi = new FtApi('f65958a8e35bd14bc52f268b8b3ab4ad');

  ftApi.setLogLevel(FtApi.LOG_LEVEL_INFO);
  // Optional parameters which override the defaults
  // Optional, set true by default: Combine responses and return them on 'loadComplete'
  //initConfig.aggregateResponse    = true;
  // Optional, set by default: The domain for the CAPI
  //initConfig.apiDomain        = 'api.ft.com';
  // Optional, set by default
  //initConfig.itemNotificationsPath  = '/content/notifications/v1/items';
  // Optional, set by default: Time in ms between requests, to control speed of comms
  //initConfig.apiUpdateDelay      = 125;
  // Optional, set by default: The number of items returned per request
  //config.limit            = 200;


  // Get a list of modified articles from the CAPI
  ftApi.notifications.fetchItems(config);

  // A 'notificationsRequestComplete' event is fired after each request to the API
  ftApi.notifications.on('notificationsRequestComplete', function () {
    console.log('notificationsRequestComplete');
  });

  // A 'notificationsLoadComplete' event is fired after all the requests have been made
  ftApi.notifications.on('notificationsLoadComplete', function () {
    console.log('notificationsLoadComplete');
  });

  // A request error of any sort emit a 'requestError' event
  ftApi.notifications.on('requestError', function (request) {
    console.log(request);
  });

}
getNotifications();