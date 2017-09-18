const assert = require("assert");
const express = require("express");
const request = require("request-promise-native");
const splitStream = require("split");

const logger = require("../src/logger.js");

describe("logger.js は", () => {
    let server;
    let streamPromise;
    beforeEach(() => {
        let stream = splitStream();
        streamPromise = new Promise((resolve, reject) => {
            let data = "";
            stream.on("data", (line) => {
                data += line;
            });
            stream.on("end", () => {
                resolve(data);
            });
        });

        let app = express();
        app.use(logger.middleware(stream));
        app.all("/", (request, response) => {
            response.send("ok");
        });

        server = app.listen(3001);
    });
    afterEach(() => {
        server.close();
    });

    it("JSON をロギングできる", async () => {
        request.post("http://localhost:3001", {
            json: {
                "foo": "bar",
            },
        });

        let logData = await streamPromise;
        assert.equal(logData, '{"foo":"bar"}');
    });
});
