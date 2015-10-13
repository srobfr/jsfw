var extend = require("extend");
var Core = require("ioc-core");

/**
 * JsFw bootstrap
 */
var config = extend(true, {},
    require(__dirname + "/config/config_jsfw.js"),
    {
        ioc: {
            // Commandes
            mainCommand: __dirname + "/src/commands/MainCommand.js"
        },

        logs: {
            level: 4
        }
    });

var core = new Core(config);
core.init()
    .done();
