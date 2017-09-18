const assert = require("assert");
const request = require("request-promise-native");
const sinon = require("sinon");
const splitStream = require("split");
const { createHmac } = require("crypto");
const { Client } = require("@line/bot-sdk");

const listen = require("../src/index.js");
const logger = require("../src/logger.js");

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
            sinon.stub(Client.prototype, "replyMessage"),
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

    it("POST /callback は送信したデータと同じものを返す", async () => {
        let requestBody = {
            events: [
                {
                    type: "message",
                    replyToken: "yyy",
                },
            ],
        };
        let signature = createHmac("SHA256", process.env.CHANNEL_SECRET).update(JSON.stringify(requestBody)).digest("base64");

        let body = await request.post(baseUrl + "/callback", {
            headers: {
                "X-Line-Signature": signature,
            },
            json: requestBody
        });

        assert.deepEqual(body, requestBody);
        sinon.assert.calledWith(Client.prototype.replyMessage, requestBody.events[0].replyToken, {
            type: "text",
            text: "こんにちは",
        });
    });

    it("POST /callback は適切なヘッダーがないと 401 を返す", async () => {
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

    it("POST 以外の /callback は 404 を返す", async () => {
        try {
            await request.get(baseUrl + "/callback");
            assert.fail();
        }
        catch (errorResponse) {
            assert.equal(errorResponse.statusCode, 404);
        }
    });
});
