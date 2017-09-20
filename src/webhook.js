const { Client, validateSignature } = require("@line/bot-sdk");
const { SignatureValidationFailed, JSONParseError } = require("@line/bot-sdk/exceptions");

class Webhook {

    constructor(config) {
        this.secret = config.channelSecret;
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

    receive(rawBody, signature) {
        let events = this.parseEvents(rawBody, signature);
        return events.map(this.handleEvent.bind(this));
    }

    async handleEvent(event) {
        if (event.type === "message") {
            return await this.client.replyMessage(event.replyToken, {
                type: "text",
                text: "こんにちは",
            });
        }
    }

    parseEvents(rawBody, signature) {
        let isValid = validateSignature(rawBody, this.secret, signature);
        if (!isValid) {
            throw new SignatureValidationFailed("signature validation failed", signature);
        }

        let data;
        try {
            data = JSON.parse(rawBody);
        }
        catch (error) {
            throw new JSONParseError(error.message, rawBody);
        }

        let hasWellFormedEvents = Array.isArray(data.events);
        if (!hasWellFormedEvents) {
            throw new JSONParseError("no well-formed events", rawBody);
        }

        return data.events;
    }
}

module.exports.Webhook = Webhook;
