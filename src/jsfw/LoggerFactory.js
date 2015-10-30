var chalk = require('chalk');
var Moment = require('moment');
var util = require('util');
var _ = require('underscore');

/*
 * Génère des loggers
 */
var LoggerFactory = function LoggerFactory(core) {
    var that = this;

    /**
     * Retourne un logger nommé.
     *
     * @param {String} name Le nom du logger.
     *
     * @returns {Logger}
     */
    this.getLogger = function (name) {
        var logLevel = parseInt(core.config.logs.level || 0);

        if (name === undefined) {
            var e = new Error('dummy');
            name = /LoggerFactory\.js.*?\n.*?\/([^\/]+?)\.js/.exec(e.stack)[1];
        }

        return new (function Logger() {
            var that = this;

            // Fonction qui ne fait rien
            var dumb = function () {
            };

            var doLog = function (objects, color, showPrefix) {
                var args = [];

                if(showPrefix) {
                    args.push(
                        Moment().format('HH:mm:ss'), // Horodatage
                        chalk.blue('[' + name + ']') // Nom du logger
                    );
                }

                _.each(objects, function (v) {
                    var msg;
                    if (typeof v === 'string') {
                        msg = v;
                    } else if (v instanceof Error) {
                        msg = v.stack;
                    } else {
                        msg = util.inspect(v, {showHidden: true, depth: 5 });
                    }

                    msg = (color ? color(msg) : msg);
                    args.push(msg);
                });

                console.log.apply(this, args);
            };

            that.error = (logLevel < 1 ? dumb : function () {
                doLog(arguments, chalk.red);
            });

            that.fail = (logLevel < 1 ? dumb : function () {
                doLog(arguments, chalk.red);
            });

            that.success = (logLevel < 1 ? dumb : function () {
                doLog(arguments, chalk.green);
            });

            that.warn = (logLevel < 2 ? dumb : function () {
                doLog(arguments, chalk.yellow);
            });

            that.info = (logLevel < 3 ? dumb : function () {
                doLog(arguments, null);
            });

            that.log = (logLevel < 3 ? dumb : function () {
                doLog(arguments, null, true);
            });

            that.debug = (logLevel < 4 ? dumb : function () {
                doLog(arguments, chalk.gray, true);
            });
        })();
    };
};

module.exports = LoggerFactory;
