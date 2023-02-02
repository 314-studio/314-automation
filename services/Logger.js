const _logger = {};
const logger = new Proxy(_logger, {
    get(o, prop) {
        return function (...arg) { 
            console[prop](new Date().toISOString(), ...arg) 
        };
    }
});

module.exports = logger;