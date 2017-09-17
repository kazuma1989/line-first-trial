const express = require("express");
const line = require("@line/bot-sdk");
const exceptions = require("@line/bot-sdk/exceptions");

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

let app = express();
let client = new line.Client(config);

app.get("/", (request, response) => {
    response.send("hello world");
});

// LINE endpoint
app.post("/callback", (request, response, next) => {
    let signature = request.get("X-Line-Signature");
    if (signature) {
        next();
    }
    else {
        let error = new exceptions.SignatureValidationFailed("no signature");
        error.signature = signature;
        next(error);
    }
}, line.middleware(config), (request, response) => {
    console.log(request.body);
    response.send(request.body);
});

app.use((error, request, response, next) => {
    if (error instanceof exceptions.SignatureValidationFailed) {
        response.status(401).send(error.signature);
    }
    else if (error instanceof exceptions.JSONParseError) {
        response.status(400).send(error.raw);
    }
    else {
        next(error);
    }
});

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("Node app is running on port", port);
});
