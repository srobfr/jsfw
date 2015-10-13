var assert = require("assert");
var Core = require("ioc-core");
var _ = require("underscore");

var root = __dirname.replace(new RegExp("/tests/jsfw/.*$"), "");

describe('CommandManager', function() {

    // Config par défaut
    var config = {
        ioc: {
            loggerFactory: root + "/src/jsfw/LoggerFactory.js",
            commandsManager: root + "/src/jsfw/CommandsManager.js"
        },
        logs: {level: 4}
    };

    // On prépare une commande de test
    var testCommand = {
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

        action: function(argv) {
            logger.debug(argv);
        }
    };

    describe('#setCommand()', function() {
        it('should set command', function(done) {
            var core = new Core(config);
            core.init()
                .then(function() {
                    var commandManager = core.components.commandsManager;
                    assert.equal(0, _.keys(commandManager.commands).length);
                    commandManager.setCommand(testCommand);
                    assert.equal(testCommand, commandManager.commands.main);
                })
                .done(done);
        });

        it('should not accept command without action', function(done) {
            var core = new Core(config);
            core.init()
                .then(function() {
                    var commandManager = core.components.commandsManager;
                    assert.throws(function () {
                        commandManager.setCommand({bad: "command"});
                    }, Error);
                })
                .done(done);
        });
    });

    describe('#run()', function() {
        it('should execute given action', function(done) {
            var core = new Core(config);
            core.init()
                .then(function() {
                    var commandManager = core.components.commandsManager;
                    commandManager.setCommand({
                        name: "foo",
                        arguments: [{name: "firstArg"}],
                        action: function(argv) {
                            assert.equal("test", argv.firstArg);
                            done();
                        }
                    });
                    commandManager.run(["node", "script", "foo", "test"]);
                })
                .done();
        });

        it('should execute default action', function(done) {
            var core = new Core(config);
            core.init()
                .then(function() {
                    var commandManager = core.components.commandsManager;
                    commandManager.setCommand({
                        action: function(argv) {
                            done();
                        }
                    });
                    commandManager.defaultCommand = "main";
                    commandManager.run(["node", "script"]);
                })
                .done();
        });

        it('should add --help option to every commands', function(done) {
            var core = new Core(config);
            core.init()
                .then(function() {
                    var commandManager = core.components.commandsManager;
                    commandManager.setCommand({
                        action: function(argv) {
                            done();
                        }
                    });

                    assert.equal("help", commandManager.commands.main.options[0].name);
                    done();
                })
                .done();
        });

        it('should reroute --help option on every commands to help command', function(done) {
            var core = new Core(config);
            core.init()
                .then(function() {
                    var commandManager = core.components.commandsManager;
                    commandManager.setCommand({
                        name: "help",
                        arguments: [{name: "command"}],
                        action: function(argv) {
                            assert.equal("foo", argv.command);
                            done();
                        }
                    });

                    commandManager.setCommand({
                        name: "foo",
                        action: function(argv) {
                            assert.fail("foo action should not have been executed.");
                        }
                    });

                    commandManager.run(["node", "script", "foo", "--help"]);
                })
                .done();
        });
    });
});