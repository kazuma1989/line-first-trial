module.exports = {
    info: console.log.bind(console),
    debug: console.debug.bind(console),
    middleware: (stream) => {
        return (request, response, next) => {
            if (request.method === "POST") {
                request.pipe(stream || process.stdout);
            }
            next();
        };
    },
};
