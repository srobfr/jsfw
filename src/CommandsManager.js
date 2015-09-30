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

    that.commands = {};
    that.version = null;
    that.defaultCommand = null;

    /**
     * Initialise le composant
     */
    that.init = function () {
        // On va chercher la version dans le fichier package.json
        return Q.nfcall(fs.readFile, core.config.root + "/package.json", "utf-8")
            .then(function (data) {
                var packageJson = JSON.parse(data);
                that.version = packageJson.version || that.version;
            }, function () {
                // Le fichier package.json n'existe probablement pas.
            });
    };

    /**
     * Ajoute une commande.
     *
     * @param command
     */
    that.setCommand = function (command) {
        if (command.name === undefined) {
            command.name = "main";
        }

        command.options = command.options || [];
        command.options.push({
            name: "help",
            aliases: ["-h"],
            description: "Shows help screen.",
            flag: true
        });

        that.commands[command.name] = command;
    };

    that.run = function () {
        try {
            run(process.argv.slice(2));
        } catch (e) {
            logger.error(e.message + "\n");
            // On affiche l'aide générale.
            run(["help"]);
        }
    };

    /**
     * Parse les arguments de la ligne de commande et exécute les commandes correspondantes.
     */
    function run(argv) {
        function parseCommand(argv, commands, result) {
            if (argv.length < 1) return 0;
            var re = new RegExp("^(" + _.pluck(commands, "name").join("|") + ")$");
            var m = argv[0].match(re);
            if (!m) return 0;

            var command = _.findWhere(commands, {name: m[1]});
            var r = 1;
            var parsedCount = 0;
            do {
                parsedCount = parseArgumentOrOption(argv.slice(r), command, result);
                r += parsedCount;
            } while (parsedCount > 0);

            // On va vérifier les options & arguments requis.
            var errors = [];
            _.each(command.arguments, function (argument) {
                if (!argument.required || result[argument.name] !== undefined) return;
                errors.push("The argument <" + argument.name + "> is required.");
            });

            _.each(command.options, function (option) {
                if (!option.required || result[option.name] !== undefined) return;
                errors.push("The option --" + option.name + " is required.");
            });

            if (errors.length > 0) {
                logger.error(errors.join("\n") + "\n");

                // Puis on affiche l'aide de la commande.
                run(["help", command.name]);
                return 1;
            }

            // Exécution de la commande.
            command.action(result);

            return r;
        }

        function parseArgumentOrOption(argv, command, result) {
            return parseOption(argv, command.options, result)
                || parseArgument(argv, command.arguments, result);
        }

        function parseOption(argv, options, result) {
            var r = 0;
            if (argv.length === 0) return r;

            var allOptionsRe = new RegExp(
                "^("
                + _.flatten(
                    _.map(options, function (option) {
                        return _.union(["--" + option.name], (option.aliases || []));
                    })
                ).join("|")
                + ")(=([^]*))?$");

            var option = null;
            var value = null;

            for (var i in options) {
                if (!options.hasOwnProperty(i)) continue;
                var re = new RegExp("^(" + ["--" + options[i].name].concat(options[i].aliases || []).join("|") + ")(=([^]*))?$");
                var m = argv[0].match(re);
                if (!m) continue;
                // Option trouvée.
                option = options[i];
                value = m[3];
            }

            if (option === null) return r;
            r++;

            if (value === undefined && !option.flag) {
                // On regarde si l'argument suivant peut être une valeur.
                if (argv[r] && !argv[r].match(allOptionsRe)) {
                    value = argv[r];
                    r++;
                } else if (option.default) {
                    value = option.default;
                } else if (option.required) {
                    throw new Error("The option --" + option.name + " should have a value.");
                }
            }

            if (option.flag) {
                value = true;
            }

            if (result[option.name] && !option.array) {
                throw new Error("The option --" + option.name + " cannot be given multiple times.");
            }

            result[option.name] = (option.array ? (result[option.name] || []).concat([value]) : value);

            return r;
        }

        function parseArgument(argv, arguments, result) {
            var r = 0;
            if (argv.length === 0) return r;

            // On va chercher le premier argument qui n'est pas encore renseigné (ou le premier défini comme tableau).
            var argument = _.find(arguments, function (argument) {
                return argument.array || result[argument.name] === undefined;
            });

            if (!argument) {
                throw new Error("Too many arguments.");
            }

            result[argument.name] = (argument.array ? (result[argument.name] || []).concat([argv[0]]) : argv[0]);
            return 1;
        }

        var result = {};
        var parsedArguments = parseCommand(argv, that.commands, result);
        if (parsedArguments === 0) {
            // On réessaie avec la commande par défaut.
            argv.unshift(that.defaultCommand);
            result = {};
            parsedArguments = parseCommand(argv, that.commands, result);
        }

        if (parsedArguments === 0) {
            throw new Error("Aucune commande reconnue.");
        }
    }
};

module.exports = CommandsManager;