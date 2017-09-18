const assert = require("assert");
const request = require("request-promise-native");
const sinon = require("sinon");
const splitStream = require("split");

const listen = require("../index.js");
const logger = require("../logger.js");

describe("index.js は", () => {
    let baseUrl;
    let stubs;
    before(() => {
        process.env.CHANNEL_ACCESS_TOKEN = "xxx";
        process.env.CHANNEL_SECRET = "xxx";
        process.env.PORT = 3000;

        baseUrl = `http://localhost:${process.env.PORT}`;

        let stubMiddleware = logger.middleware(splitStream());
        stubs = [
            sinon.stub(logger, "info"),
            sinon.stub(logger, "debug"),
            sinon.stub(logger, "middleware").returns(stubMiddleware),
        ];
    });
    after(() => {
        stubs.forEach(stub => stub.restore());
    });

    let server;
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
