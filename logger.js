const morgan = require("morgan");

morgan.token("body", (request, response) => {
    return "[body]";
});

module.exports = {
    info: console.log.bind(console),
    debug: console.debug.bind(console),
    middleware: (stream) => {
        return morgan(":body", {
            stream: stream,
        });
    },
};
