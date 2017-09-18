const { Webhook } = require("../src/webhook.js");

describe("Webhook は", () => {
    it("aa", () => {
        let webhook = new Webhook({
            channelAccessToken: "xxx",
            channelSecret: "xxx",
        });
    });
});
