const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");
const { SignatureValidationFailed, JSONParseError } = require("@line/bot-sdk/exceptions");

const logger = require("./logger.js");

if (require.main === module) {
    listen();
}
else {
    module.exports = listen;
}

function listen() {
    const port = process.env.PORT;
    const config = {
        channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
        channelSecret: process.env.CHANNEL_SECRET,
    };

    let app = express();

    app.use(logger.middleware());

    // root endpoint
    app.get("/", (request, response) => {
        response.send("hello world");
    });

    // LINE endpoint
    let client = new Client(config);
    app.post("/callback", middleware(config), (request, response) => {
        let event = request.body.events[0];
        if (event.type === "message") {
            client.replyMessage(event.replyToken, {
                type: "text",
                text: "こんにちは",
            });
        }

        response.send(request.body);
    });

    let lineErrorHandler = (error, request, response, next) => {
        if (error instanceof SignatureValidationFailed) {
            response.status(401).send(error.signature);
        }
        else if (error instanceof JSONParseError) {
            response.status(400).send(error.raw);
        }
        else {
            next(error);
        }
    };
    app.use(lineErrorHandler);

    return app.listen(port, () => {
        logger.info(`Node app is running on port ${port}`);
    });
}
