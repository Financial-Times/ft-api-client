
module.export = function (path, quantity) {
    var pageApiUrl = model.Pages.findByTitle(path).apiUrl;
    var self = this;
    function promiseOfPage () {
        return function (resolve, reject) {
            request({
                    url: pageApiUrl + '/main-content',
                    qs: {
                        apiKey: self.apiKey
                    },
                    headers: self.headers,
                    timeout: 2000
                }, function (err, response, body) {
                        var idList;
                        if (err) return reject(err);

                        if (response.statusCode >= 400) {
                            resolve(undefined);
                        }
                        // TODO sort out this mess!
                        try {
                            body = JSON.parse(body);
                            idList = _.map(body.pageItems, function (item) {
                                        return item.id;
                                    }).slice(0, (quantity || 5));
                        } catch (error) {
                            return reject('error parsing JSON');
                        }
                        resolve(idList);
                });
            };
    }
    return new Promise(promiseOfPage(path));
};
