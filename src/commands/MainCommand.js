var chalk = require('chalk');
var Moment = require('moment');
var util = require('util');
var _ = require('underscore');

/*
 * Génère des loggers
 */
var MainCommand = function MainCommand(core, loggerFactory, commandsManager) {
    var that = this;
    var logger = loggerFactory.getLogger();

    /**
     * Configuration de la commande.
     */
    var commandConfig = {
        name: "test",
        description: "Commande de test.",
        doc: ["Cette commande est un test.", "Sur plusieurs lignes.", "", "Oui, oui."].join("\n"),
        arguments: [
            {
                name: "arg1",
                description: "Argument 1.",
                validator: function(val) {return val.match(/^[0-9]+/);},
                default: "plop", // valeur par défaut. Peut être un tableau si array=true
                required: true,
                array: false // Si true, l'argument est une liste (qui peut être vide sauf si required = true.
            }
        ],

        options: [
            {
                name: "opt1",
                aliases: ["-o"],
                description: "Première option.",
                validator: function(val) {return val.match(/^[0-9]+/);},
                default: "plop",
                required: true,
                array: false
            }
        ],

        action: action
    };

    /**
     * Action effectuée par la commande.
     */
    function action(foo, bar) {
        logger.log(foo, bar);
    }

    /**
     * Init
     */
    that.init = function() {
        commandsManager.addCommand(commandConfig);
    };
};

module.exports = MainCommand;