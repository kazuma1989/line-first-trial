const assert = require("assert");
const sinon = require("sinon");
const { Client } = require("@line/bot-sdk");

const { Human, Bot } = require("../src/human.js");

describe("Human と Bot は", () => {
    let event;
    let envs;
    let stubs;

    before(() => {
        envs = {
            CHANNEL_ACCESS_TOKEN: "xxx",
        };
        Object.keys(envs).forEach((key) => {
            process.env[key] = envs[key];
        });

        stubs = [
            sinon.stub(Client.prototype, "replyMessage").returns(Promise.resolve()),
        ];
    });
    after(() => {
        Object.keys(envs).forEach((key) => {
            delete process.env[key];
        });

        stubs.forEach(stub => stub.restore());
    });

    beforeEach(() => {
        event = {
            type: "message",
            replyToken: "yyy",
            message: {
                type: "text",
                text: "こんにちは",
            },
        };
    });

    it("会話できる", async () => {
        let human = new Human(event);
        let bot = new Bot();

        human.talkTo(bot);
        await bot.talkTo(human);

        sinon.assert.calledOnce(Client.prototype.replyMessage);
    });
});
