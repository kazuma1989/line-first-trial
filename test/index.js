const assert = require("assert");
const request = require("request-promise-native");
const sinon = require("sinon");

const logger = require("../logger.js");
sinon.stub(logger, "info");
sinon.stub(logger, "debug");
sinon.stub(logger, "middleware").callsFake((request, response, next) => {
    next();
});

process.env.CHANNEL_ACCESS_TOKEN = "xxx";
process.env.CHANNEL_SECRET = "xxx";
process.env.PORT = 3000;
const listen = require("../index.js");

describe("index.js は", () => {
    let server;
    let baseUrl = `http://localhost:${process.env.PORT}`;

    beforeEach(() => {
        server = listen();
    });
    afterEach(() => {
        server.close();
    });

    it("GET / で hello world を返す", async () => {
        let body = await request.get(baseUrl + "/");
        assert.equal(body, "hello world");
    });

    it("POST 以外の /callback は 404 を返す", async () => {
        try {
            await request.get(baseUrl + "/callback");
            assert.fail();
        }
        catch (errorResponse) {
            assert.equal(errorResponse.statusCode, 404);
        }
    });

    it("POST /callback は適切なヘッダーがないと 401", async () => {
        try {
            await request.post(baseUrl + "/callback", {
                headers: {
                    "X-Line-Signature": "this is invalid",
                },
                json: {}
            });
            assert.fail();
        }
        catch (errorResponse) {
            assert.equal(errorResponse.statusCode, 401);
        }
    });
});
