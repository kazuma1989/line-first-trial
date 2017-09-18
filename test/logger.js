const assert = require("assert");
const express = require("express");
const request = require("request-promise-native");
const split = require("split");

const logger = require("../logger.js");

describe("logger.js は", () => {
    let server;

    beforeEach(() => {
        let app = express();
        app.use(logger.middleware(split().on("data", (line) => {
            console.log(line);
        })));
        app.get("/", (request, response) => {
            response.send("ok");
        });
        server = app.listen(3001);
    });
    afterEach(() => {
        server.close();
    });

    it("", async () => {
        let body = await request.get("http://localhost:3001");
        assert.equal(body, "ok");
    });
});
