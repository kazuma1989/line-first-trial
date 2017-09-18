const morgan = require("morgan");

module.exports = {
    info: console.log.bind(console),
    debug: console.debug.bind(console),
    middleware: morgan("dev"),
};
