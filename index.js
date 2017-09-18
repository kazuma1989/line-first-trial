const express = require("express");
const bodyParser = require("body-parser");
const { Client, middleware } = require("@line/bot-sdk");
const { SignatureValidationFailed, JSONParseError } = require("@line/bot-sdk/exceptions");

const logger = require("./logger.js");

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

let app = express();

app.use(logger.middleware);

app.get("/", (request, response) => {
    response.send("hello world");
});
app.post("/*", (request, response, next) => {
    bodyParser.raw({ type: "*/*" })(request, response, () => {
        let body = request.body.toString();
        logger.info(body);
        next();
    });
});

// LINE endpoint
let client = new Client(config);
app.post("/callback", middleware(config), (request, response) => {
    logger.info(request.body);

    // let event = request.body.events[0];

    response.send(request.body);
});

app.use((error, request, response, next) => {
    if (error instanceof SignatureValidationFailed) {
        response.status(401).send(error.signature);
    }
    else if (error instanceof JSONParseError) {
        response.status(400).send(error.raw);
    }
    else {
        next(error);
    }
});

let listen = () => {
    let port = process.env.PORT;
    return app.listen(port, () => {
        logger.info(`Node app is running on port ${port}`);
    });
};
if (require.main === module) {
    listen();
}
else {
    module.exports = listen;
}
