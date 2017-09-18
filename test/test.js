const assert = require("assert");
const request = require("request-promise-native");
const bodyParser = require("body-parser");

const listen = require("../index.js");

describe("index.js は", () => {
    let server;
    let port = 49152;

    beforeEach(() => {
        server = listen(port);
    });
    afterEach(() => {
        server.close();
    });

    it("GET / で hello world を返す", async () => {
        await request.get(`http://localhost:${port}/`).then((body) => {
            assert.equal(body, "hello world");
        });
    });
});
