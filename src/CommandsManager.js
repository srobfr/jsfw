var fs = require('fs');
var chalk = require('chalk');
var _ = require('underscore');
var Q = require('q');

/*
 * Gère la ligne de commande.
 */
var CommandsManager = function CommandsManager(core, loggerFactory) {
    var that = this;
    var logger = loggerFactory.getLogger();

    var commands = {};

    that.version = null;
    that.defaultCommand = "help";

    /**
     * Initialise le composant
     */
    that.init = function() {
        // On va chercher la version dans le fichier package.json
        return Q.nfcall(fs.readFile, core.config.root + "/package.json", "utf-8")
            .then(function(data) {
                var packageJson = JSON.parse(data);
                that.version = packageJson.version || that.version;
            }, function() {
                // Le fichier package.json n'existe probablement pas.
            });
    };

    /**
     * Ajoute une commande.
     *
     * @param command
     */
    that.addCommand = function(command) {
        var name = command.name || "main";
        if(commands[name] !== undefined) {
            throw new Error('La commande "' + name + '" est déjà chargée.');
        }

        commands[name] = command;
    };

    /**
     * Parse les arguments de la ligne de commande et exécute les commandes correspondantes.
     */
    that.run = function() {
        logger.debug(commands);
        var argv = process.argv.slice(2);

        // On construit un parser simple.
        var graph = [];
        function graphCommands(commands) {
            return _.map(_.values(commands), function(command) {
                return {
                    v: command.name,
                    g: _.union(graphArguments(commands.arguments), graphOptions(commands.options))
                };
            });
        }

        function graphArguments(args) {
            return _.map(args, function(argument) {
                // TODO

                return {
                    v: argument.validator || /[^]*/,
                    g: TODO // TODO
                }
            });
        }

        logger.log(graph);
    };
};

module.exports = CommandsManager;