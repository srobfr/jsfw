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

    /**
     * Affiche l'aide générale
     */
    function showGlobalHelp() {
        var sortedCommands = _.values(commandsManager.commands)
            .sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

        var blocks = [];

        if(commandsManager.version) {
            blocks.push({
                title: "Version:",
                value: commandsManager.version
            });
        }

        blocks.push({
            title: "Usage:",
            value: "command [options] [arguments]"
        });

        blocks.push({
            title: "Available commands:",
            value: _.map(sortedCommands, function(command) {
                return {
                    title: command.name,
                    value: command.description || ""
                }
            })
        });

        echoBlocks(blocks);
    }

    /**
     * Affiche l'aide spécifique à une commande.
     *
     * @param commandName
     */
    function showCommandHelp(commandName) {
        var command = commandsManager.commands[commandName];
        if(!command) {
            logger.error("Unknown command : " + commandName + "\n");
            return showGlobalHelp();
        }

        var shorts = [];
        var argsBlocks = [];
        var optsBlocks = [];

        _.each(command.arguments || [], function (argument) {
            var arg = argument.name;
            if (argument.array) arg += "...";
            arg = (argument.required ? arg : "[" + arg + "]");
            shorts.push(arg);

            var flagsMsg = [];
            if(argument.required) flagsMsg.push(chalk.yellow("requis"));
            if(argument.array) flagsMsg.push(chalk.yellow("multiple"));
            if(argument.default) flagsMsg.push('"' + chalk.yellow(argument.default) + '" par défaut');
            flagsMsg = (flagsMsg.length === 0 ? "" : " (" + flagsMsg.join(", ") + ")");

            argsBlocks.push({
                title: arg,
                value: argument.description + flagsMsg
            });
        });

        _.each(command.options || [], function (option) {
            var opt = "--" + option.name;
            if(option.aliases) {
                opt = opt + "|" + option.aliases.join("|")
            }

            if (option.array) opt += "*";
            opt = (option.required ? opt : "[" + opt + "]");
            shorts.push(opt);

            var flagsMsg = [];
            if(option.required) flagsMsg.push(chalk.yellow("valeur requise"));
            if(option.array) flagsMsg.push(chalk.yellow("multiple"));
            if(option.default) flagsMsg.push(chalk.yellow(JSON.stringify(option.default)) + ' par défaut');
            flagsMsg = (flagsMsg.length === 0 ? "" : " (" + flagsMsg.join(", ") + ")");

            optsBlocks.push({
                title: opt,
                value: option.description + flagsMsg
            });
        });

        var blocks = [];

        // Description (sur une ligne).
        if(command.description) {
            blocks.push({
                title: "Description:",
                value: command.description
            });
        }

        // Usage
        blocks.push({
            title: "Usage:",
            value: commandName + " " + shorts.join(" ")
        });

        // Arguments
        blocks.push({
            title: "Arguments:",
            value: argsBlocks
        });

        // Options
        blocks.push({
            title: "Options:",
            value: optsBlocks
        });

        // Documentation
        if(command.help) {
            blocks.push({
                title: "Help:",
                value: command.help
            });
        }

        echoBlocks(blocks);
    }

    function echoBlocks(blocks) {
        var lines = getBlocksLines(blocks, 0);
        console.log(lines.join("\n").trim());
    }

    function getBlocksLines(blocks, indentLevel) {
        var lines = [];
        if(typeof blocks === "string") {
            lines = lines.concat(_.map(blocks.split("\n"), function(line) {
                return (new Array(indentLevel + 1)).join("  ") + line;
            }));
        } else {
            var maxBlockTitleLength = null;
            _.each(blocks, function(block) {
                if(indentLevel === 0) {
                    lines.push(chalk.yellow(block.title));
                    lines = lines.concat(getBlocksLines(block.value, indentLevel + 1));
                    lines.push("");
                } else {
                    maxBlockTitleLength = maxBlockTitleLength || _.reduce(blocks, function(memo, block) {
                        return block.title ? Math.max(memo, block.title.length) : memo;
                    }, 0);

                    var blockLines = block.value.split("\n");
                    _.each(blockLines, function(blockLine, i) {
                        var title = chalk.green(block.title) + (new Array(maxBlockTitleLength - block.title.length + 1)).join(" ");
                        var prefix = (i===0 ? title : (new Array(maxBlockTitleLength + 1)).join(" "));
                        lines.push((new Array(indentLevel + 1)).join("  ") + prefix + "  " + blockLine);
                    });
                }
            });
        }

        return lines;
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