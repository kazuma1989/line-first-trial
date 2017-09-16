const express = require("express");
const bodyParser = require("body-parser");

let app = express();

app.use(bodyParser.json());

app.get("/", (request, response) => {
    response.send("hello world");
});

app.post("/callback", (request, response) => {
    console.log(request.body);
    response.send(request.body);
});

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("Node app is running on port", port);
});
