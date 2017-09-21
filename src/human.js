const { Client } = require("@line/bot-sdk");

class Human {

    constructor(event) {
        this.event = event;
        this.client = new Client({
            channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
        });
    }

    talkTo(bot) {
        if (this.event.type === "msssage") {
            bot.listenTo(this.event.message);
        }
    }

    async listenTo(response) {
        await this.client.replyMessage(this.event.replyToken, response);
    }
}

class Bot {

    listenTo(message) {
        if (message.type !== "text") {
            return;
        }

        let baseUrl = "https://line-first-trial.herokuapp.com";
        this.response = ((text) => {
            switch (text) {
                case "はい":
                    return {
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

                case "いいえ":
                    return;

                case "違うやつお願い":
                    return {
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

                default:
                    return {
                        type: "template",
                        altText: "こんにちは 何かご用ですか？（はい／いいえ）",
                        template: {
                            type: "confirm",
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
            }
        })(message.text);
    }

    async talkTo(human) {
        await human.listenTo(this.response);
    }
}

module.exports.Human = Human;
module.exports.Bot = Bot;
