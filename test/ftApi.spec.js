var events = require("events"),
    ftApi = require("../ftApi.js");

describe("FT Api Client", function () {
    var content = ftApi.content,
        notifications = ftApi.notifications;

    it("exports notifications, content and utils", function() {
        expect(ftApi.notifications).toBeDefined();
        expect(ftApi.content).toBeDefined();
        expect(ftApi.utils).toBeDefined();
    });

    it("exports content with getApiContent, getPage, getPageMainContent, getPages and getApiItem calls", function () {
        var callNames = ["getApiContent", "getPage", "getPageMainContent", "getPages", "getApiItem"];

        callNames.forEach(function (callName) {
            expect(content[callName]).toBeDefined();
            expect(typeof content[callName]).toEqual("function");
        });
    });

    it("exports notifications with a fetchItems call", function () {
        expect(notifications.fetchItems).toBeDefined();
        expect(typeof notifications.fetchItems).toEqual("function");
    });

    it("provides default configuration for content calls", function () {
        expect(content.config).toBeDefined();
        expect(typeof content.config).toEqual("object");
    });

    it("provides default configuration for notifications calls", function () {
        expect(notifications.config).toBeDefined();
        expect(typeof notifications.config).toEqual("object");
    });

    it("can emit content events because content is an EventEmitter", function () {
        expect(content instanceof events.EventEmitter).toBeTruthy();
    });

    it("can emit notifications events because notifications is an EventEmitter", function () {
        expect(notifications instanceof events.EventEmitter).toBeTruthy();
    });
});
