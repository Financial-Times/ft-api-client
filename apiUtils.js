// Merge any passed config with the default or previosuly set config
exports.mergeConfig = function (config, passedConfig) {
	var key;

	// Don't bother trying to parse anything other than an object
	if (typeof config === 'object') {
		for (key in passedConfig) {
			if (passedConfig.hasOwnProperty(key)) {
				config[key] = passedConfig[key];
			}
		}
	}
	
	return config;
};

// Flatten the response from the CAPI notifications to juts a list of IDs
exports.flattenNotificationsResponse = function (notificationsResponseList) {
	var itemsList = [], i;
	for (i = 0; i < notificationsResponseList.length; i++) {
		itemsList.push(notificationsResponseList[i].data['content-item'].id);
	}
	return itemsList;
};