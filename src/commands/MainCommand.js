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
        name: "main",
        description: "Commande de test.",
        help: ["Cette commande est un test.", "Sur plusieurs lignes.", "", "Oui, oui."].join("\n"),
        strictOptionsCheck: false, // Si true, les arguments qui ressemblent à des options sont rejetés.
        arguments: [
            {
                name: "arg1",
                description: "Argument 1.",
                default: "plop", // valeur par défaut. Peut être un tableau si array = true
                required: true,
                array: false // Si true, l'argument est une liste (qui peut être vide sauf si required = true).
            },
            {
                name: "plopArg",
                description: "Argument Plop,\nsur plusieurs lignes.",
                default: ["plop"], // valeur par défaut. Doit être un tableau si array = true
                required: false,
                array: true // Si true, l'argument est une liste (qui peut être vide sauf si required = true).
            }
        ],

        options: [
            {
                name: "option1",
                aliases: ["-o"],
                description: "Première option.\nSur plusieurs lignes.",
                default: ["plop"], // valeur par défaut. Doit être un tableau si array = true
                flag: false, // Si true, l'option ne prend pas de valeur. Incompatible avec required.
                required: true, // Si true, une valeur est requise (sous forme de --foo=bar ou --foo bar).
                array: true // Si true, il est possible de passer plusieurs fois l'option.
            }
        ],

        action: action
    };

    /**
     * Action effectuée par la commande.
     */
    function action(argv) {
        logger.log("Arguments :", argv);
    }

    /**
     * Init
     */
    that.init = function() {
        commandsManager.setCommand(commandConfig);
    };
};

module.exports = MainCommand;