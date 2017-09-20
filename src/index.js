const express = require("express");
const { raw: rawParser } = require("body-parser");

const logger = require("./logger.js");
const { Webhook } = require("./webhook.js");

let listen = () => {
    const port = process.env.PORT;
    const config = {
        channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
        channelSecret: process.env.CHANNEL_SECRET,
    };

    let app = express();
    app.use(logger.middleware());
    app.use(rawParser({
        type: "*/*"
    }));

    // root endpoint
    app.get("/", (request, response, next) => {
        response.send("hello world");
    });

    // LINE endpoint
    let webhook = new Webhook(config);
    app.post("/callback", async (request, response, next) => {
        let rawBody = request.body.toString();
        let signature = request.headers["x-line-signature"];
        try {
            await webhook.receive(rawBody || "", signature || "");
        }
        catch (error) {
            next(error);
            return;
        }

        response.status(200).send("OK");
    });

    app.use((error, request, response, next) => {
        let { status, message } = Webhook.handleError(error);
        if (status || message) {
            response.status(status).send(message);
        }
        else {
            next(error);
        }
    });

    return app.listen(port, () => {
        logger.info(`app is running on port ${port}`);
    });
}

if (require.main === module) {
    listen();
}
else {
    module.exports = listen;
}
