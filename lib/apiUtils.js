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
	console.log('Updated config', config);
	return config;
};

// Flatten the response from the CAPI notifications to just a list of IDs
exports.flattenNotificationsResponse = function (sourceList) {
	console.log(sourceList);
	var itemsList = [], i, item;
	for (i = 0; i < sourceList.length; i++) {
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