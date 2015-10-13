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

        // Niveau de logs
        logs: {level: 4},

        // Parse automatiquement les paramètres de la ligne de commande.
        autorunCommand: true
    });

var core = new Core(config);
core.init()
    .done();
