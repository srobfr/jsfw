/**
 * JsFw bootstrap
 */
var Core = require("ioc-core");
var core = new Core({
    root: __dirname,

    ioc: {
        commandsManager: __dirname + "/src/jsfw/CommandsManager.js",
        loggerFactory: __dirname + "/src/jsfw/LoggerFactory.js",

        // Commandes
        helpCommand: __dirname + "/src/commands/HelpCommand.js",
        mainCommand: __dirname + "/src/commands/MainCommand.js"
    },

    logs: {
        level: 4
    }
});

core.init()
    .done();
