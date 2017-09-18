const { Client, middleware } = require("@line/bot-sdk");
const { SignatureValidationFailed, JSONParseError } = require("@line/bot-sdk/exceptions");

class Webhook {

    constructor(config) {
        this.middleware = middleware(config);
        this.client = new Client(config);
    }

    static handleError(error) {
        if (error instanceof SignatureValidationFailed) {
            return {
                status: 401,
                message: error.signature,
            };
        }
        else if (error instanceof JSONParseError) {
            return {
                status: 400,
                message: error.raw,
            };
        }
        else {
            return;
        }
    }

    endpoint(body) {
        let event = body.events[0];
        if (event.type === "message") {
            this.client.replyMessage(event.replyToken, {
                type: "text",
                text: "こんにちは",
            });
        }
    }
}

module.exports.Webhook = Webhook;
