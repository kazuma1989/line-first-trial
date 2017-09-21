const { validateSignature } = require("@line/bot-sdk");
const { SignatureValidationFailed, JSONParseError } = require("@line/bot-sdk/exceptions");

const { Human, Bot } = require("./human.js");

class Webhook {

    constructor(secret) {
        this.secret = secret;
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

    async receive(rawBody, signature) {
        let events = this.parseEvents(rawBody, signature);
        return await events.map(this.handleEvent.bind(this));
    }

    async handleEvent(event) {
        let human = new Human(event);
        let bot = new Bot();

        human.talkTo(bot);
        return await bot.talkTo(human);
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
