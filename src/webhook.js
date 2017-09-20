const { Client, validateSignature } = require("@line/bot-sdk");
const { SignatureValidationFailed, JSONParseError } = require("@line/bot-sdk/exceptions");

const baseUrl = "https://line-first-trial.herokuapp.com/";

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
        if (event.type !== "message") {
            return;
        }

        let { type, text } = event.message;
        if (type !== "text") {
            return;
        }

        let response;
        switch (text) {
            case "はい":
                response = {
                    type: "template",
                    altText: "こちらの〇〇はいかがですか？",
                    template: {
                        type: "buttons",
                        thumbnailImageUrl: baseUrl + "/img1.jpg",
                        title: "○○レストラン",
                        text: "お探しのレストランはこれですね",
                        actions: [
                            {
                                type: "postback",
                                label: "予約する",
                                data: "action=buy&itemid=123",
                            },
                            {
                                type: "postback",
                                label: "電話する",
                                data: "action=pcall&itemid=123",
                            },
                            {
                                type: "uri",
                                label: "詳しく見る",
                                uri: baseUrl + "/img1.jpg",
                            },
                            {
                                type: "message",
                                label: "違うやつ",
                                text: "違うやつお願い",
                            },
                        ],
                    },
                };
                break;

            case "いいえ":
                return;

            case "違うやつお願い":
                response = {
                    type: "template",
                    altText: "候補を３つご案内しています。",
                    template: {
                        type: "carousel",
                        columns: [
                            {
                                thumbnailImageUrl: baseUrl + "/img2-1.jpg",
                                title: "●●レストラン",
                                text: "こちらにしますか？",
                                actions: [
                                    {
                                        type: "postback",
                                        label: "予約する",
                                        data: "action=rsv&itemid=111",
                                    },
                                    {
                                        type: "postback",
                                        label: "電話する",
                                        data: "action=pcall&itemid=111",
                                    },
                                    {
                                        type: "uri",
                                        label: "詳しく見る",
                                        uri: baseUrl + "/img2-1.jpg",
                                    },
                                ],
                            },
                            {
                                thumbnailImageUrl: baseUrl + "/img2-2.jpg",
                                title: "▲▲レストラン",
                                text: "それともこちら？",
                                actions: [
                                    {
                                        type: "postback",
                                        label: "予約する",
                                        data: "action=rsv&itemid=222",
                                    },
                                    {
                                        type: "postback",
                                        label: "電話する",
                                        data: "action=pcall&itemid=222",
                                    },
                                    {
                                        type: "uri",
                                        label: "詳しく見る",
                                        uri: baseUrl + "/img2-2.jpg",
                                    },
                                ],
                            },
                            {
                                thumbnailImageUrl: baseUrl + "/img2-3.jpg",
                                title: "■■レストラン",
                                text: "はたまたこちら？",
                                actions: [
                                    {
                                        type: "postback",
                                        label: "予約する",
                                        data: "action=rsv&itemid=333",
                                    },
                                    {
                                        type: "postback",
                                        label: "電話する",
                                        data: "action=pcall&itemid=333",
                                    },
                                    {
                                        type: "uri",
                                        label: "詳しく見る",
                                        uri: baseUrl + "/img2-3.jpg",
                                    },
                                ],
                            },
                        ],
                    },
                };
                break;

            default:
                response = {
                    type: "template",
                    altText: "こんにちは 何かご用ですか？（はい／いいえ）",
                    template: {
                        type: "confirm",
                        title: "○○レストラン",
                        text: "こんにちは 何かご用ですか？",
                        actions: [
                            {
                                type: "message",
                                label: "はい",
                                text: "はい",
                            },
                            {
                                type: "message",
                                label: "いいえ",
                                text: "いいえ",
                            },
                        ],
                    },
                };
                break;
        }

        return await this.client.replyMessage(event.replyToken, response);
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
