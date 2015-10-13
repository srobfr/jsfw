/**
 * Configuration par défaut pour JsFw
 * @type Object
 */

var root = __dirname.replace(/\/[^\/]+$/, "");

module.exports = {
    // Racine du projet
    root: root,

    // Config pour l'injection de dépendances
    ioc: {
        loggerFactory: root + "/src/jsfw/LoggerFactory.js",
        commandsManager: root + "/src/jsfw/CommandsManager.js",
        helpCommand: root + "/src/jsfw/commands/HelpCommand.js"
    }
};
