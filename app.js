/**
 * JsFw bootstrap
 */
var Core = require("ioc-core");
var core = new Core({
    root: __dirname,

    ioc: {
        loggerFactory: __dirname + "/src/LoggerFactory.js",
        commandsManager: __dirname + "/src/CommandsManager.js",

        // Commandes
        mainCommand: __dirname + "/src/commands/MainCommand.js"
    },

    logs: {
        level: 4
    }
});

core.init()
    .then(function() {
        core.components.commandsManager.run();
    })
    .done();