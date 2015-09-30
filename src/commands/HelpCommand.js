var chalk = require('chalk');
var _ = require('underscore');

/*
 * Aide pour la ligne de commandes.
 */
var HelpCommand = function HelpCommand(core, loggerFactory, commandsManager) {
    var that = this;
    var logger = loggerFactory.getLogger();

    /**
     * Configuration de la commande.
     */
    var commandConfig = {
        name: "help",
        description: "Shows the help screen.",
        arguments: [
            {
                name: "command",
                description: "Command name."
            }
        ],
        action: action
    };

    /**
     * Action effectuée par la commande.
     */
    function action(argv) {
        if (!argv.command) {
            showGlobalHelp();
        } else {
            showCommandHelp(argv.command);
        }
    }

    function showGlobalHelp() {
        var sortedCommands = _.values(commandsManager.commands)
            .sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

        var longestCommandLength = _.reduce(sortedCommands, function (memo, command) {
            return Math.max(memo, command.name.length);
        }, 0);

        var lines = [
            chalk.yellow("Usage:"),
            "  command [options] [arguments]", "",

            chalk.yellow("Available commands:"),
            _.map(sortedCommands, function (command) {
                return "  "
                    + chalk.green(command.name)
                    + (new Array(longestCommandLength - command.name.length + 1).join(" "))
                    + "    "
                    + (command.description || "");
            }), ""
            // TODO
        ];

        console.log(_.flatten(lines).join("\n"));
    }

    function showCommandHelp(commandName) {
        var command = commandsManager.commands[commandName];

        var argsShorts = [];
        var argsLines = [];

        _.each(command.arguments || [], function (argument) {
            var arg = argument.name;
            if (argument.array) arg += "...";
            arg = (argument.required ? arg : "[" + arg + "]");
            argsShorts.push(arg);
            argsLines.push("  " + chalk.green(argument.name))
        });

        var lines = [
            chalk.yellow("Usage:"),
            "  " + commandName + " " + argsShorts.join(" "), "",

            // TODO
        ];

        console.log(_.flatten(lines).join("\n"));
    }

    function align(fields) {

    }

    /**
     * Init
     */
    that.init = function () {
        commandsManager.setCommand(commandConfig);
        commandsManager.defaultCommand = commandConfig.name;
    };
};

module.exports = HelpCommand;