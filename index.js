const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const line = require("@line/bot-sdk");
const { SignatureValidationFailed, JSONParseError } = require("@line/bot-sdk/exceptions");

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || "xxx",
    channelSecret: process.env.CHANNEL_SECRET || "xxx",
};

let app = express();

let logger = morgan("combined");
app.use(logger);

app.get("/", (request, response) => {
    response.send("hello world");
});
app.post("/*", (request, response, next) => {
    bodyParser.raw({ type: "*/*" })(request, response, () => {
        let body = request.body.toString();
        console.log(body);
        next();
    });
});

// LINE endpoint
let client = new line.Client(config);
app.post("/callback", line.middleware(config), (request, response) => {
    console.log(request.body);

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

let listen = (port) => {
    port = port || process.env.PORT;
    return app.listen(port, () => {
        console.log(`Node app is running on port ${port}`);
    });
};

if (require.main === module) {
    listen(3000);
}
else {
    module.exports = listen;
}
