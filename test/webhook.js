const { Webhook } = require("../src/webhook.js");

describe("Webhook は", () => {
    it("インスタンス化できる", () => {
        let webhook = new Webhook({
            channelAccessToken: "xxx",
        });
    });
});
