'use strict';

var Logger = require('./Logger.js'),
  logger = new Logger();

// Merge any passed config with the default or previosuly set config
exports.mergeConfig = function (configA, configB) {
  var newConfig = {},
    key;

  // Add properties, favouring the second object
  for (key in configA) {
    if (configA.hasOwnProperty(key)) {
      newConfig[key] = configA[key];
    }
  }
  for (key in configB) {
    if (configB.hasOwnProperty(key)) {
      newConfig[key] = configB[key];
    }
  }
  logger.log('Updated config', logger.LOG_LEVEL_INFO);
  logger.log(newConfig, logger.LOG_LEVEL_INFO);
  return newConfig;
};

// Flatten the response from the CAPI notifications to just a list of IDs
exports.flattenNotificationsResponse = function (sourceList) {
  logger.log(sourceList, logger.LOG_LEVEL_INFO);
  var itemsList = [], i, item;
  for (i = 0; i < sourceList.length; i += 1) {
    item = sourceList[i];
    
    if (item.id) {
      // Path to id from pages response
      itemsList.push(item.id);
    } else {
      // Path to id from notifcations response
      itemsList.push(item.data['content-item'].id);
    }
  }
  return itemsList;
};
