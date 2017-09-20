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
            sinon.stub(logger, "middleware").returns(stubMiddleware),
            sinon.stub(Client.prototype, "replyMessage").returns(Promise.resolve()),
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

    describe("POST /callback に対して", () => {
        let postJsonWithSignature = async (rawBody) => {
            let signature = createHmac("SHA256", process.env.CHANNEL_SECRET).update(rawBody).digest("base64");

            return await request.post(baseUrl + "/callback", {
                headers: {
                    "Content-Type": "application/json",
                    "X-Line-Signature": signature,
                },
                body: rawBody,
            });
        };

        it("OK を返す", async () => {
            let requestBody = {
                events: [
                    {
                        type: "message",
                        replyToken: "yyy",
                        message: {
                            type: "text",
                            text: "こんにちは",
                        },
                    },
                ],
            };

            let response = await postJsonWithSignature(JSON.stringify(requestBody));

            assert.equal(response, "OK");
            sinon.assert.calledOnce(Client.prototype.replyMessage);
        });

        it("JSON が期待した構文でないと 400 を返す", async () => {
            let requestBody = {
                events: [
                    {
                        type: "message",
                        replyToken: "yyy",
                    },
                ],
            };

            try {
                await postJsonWithSignature(JSON.stringify(requestBody).substring(1));
            }
            catch (errorResponse) {
                assert.equal(errorResponse.statusCode, 400);
                return;
            }

            assert.fail();
        });

        it("JSON の構文エラー時に 400 を返す", async () => {
            let requestBody = {
                events: {
                    isArray: false
                }
            };

            try {
                await postJsonWithSignature(JSON.stringify(requestBody));
            }
            catch (errorResponse) {
                assert.equal(errorResponse.statusCode, 400);
                return;
            }

            assert.fail();
        });

        it("X-Line-Signature ヘッダーがないと 401 を返す", async () => {
            try {
                await request.post(baseUrl + "/callback", {
                    headers: {
                        // "X-Line-Signature": "this is invalid",
                    },
                    json: {}
                });
            }
            catch (errorResponse) {
                assert.equal(errorResponse.statusCode, 401);
                return;
            }

            assert.fail();
        });

        it("X-Line-Signature の値が間違っていると 401 を返す", async () => {
            try {
                await request.post(baseUrl + "/callback", {
                    headers: {
                        "X-Line-Signature": "this is invalid",
                    },
                    json: {}
                });
            }
            catch (errorResponse) {
                assert.equal(errorResponse.statusCode, 401);
                return;
            }

            assert.fail();
        });
    });

    it("POST 以外の /callback に 404 を返す", async () => {
        try {
            await request.get(baseUrl + "/callback");
        }
        catch (errorResponse) {
            assert.equal(errorResponse.statusCode, 404);
            return;
        }

        assert.fail();
    });
});
