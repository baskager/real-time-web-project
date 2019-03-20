/**
 * A wrapper class for discord.js 
 *
 * @since: 20-03-2019
 * @author: Bas Kager
 */
const Discord = require("discord.js"),
discordclient = new Discord.Client(),
triggers = require("./triggers");

module.exports = function(config, cache, environment, debug) {
  
  class DiscordHelper {
    /**
     * Constructor, initialises the connection with discord
     *
     * @since: 14-08-2018
     * @author: Bas Kager
     *
     * @param {Object} handlebars Handlebars template engine object
     *
     * @returns {void}
     */
    constructor(reminderDAO) {
      debug = debug.extend(this.constructor.name);
      this.reminderDAO = reminderDAO;
    }
    /**
     * Logs in to a discord bot with a token
     *
     * @since: 14-08-2018
     * @author: Bas Kager
     *
     * @returns {void}
     **/
    loadTriggers() {
      triggers.onReady(discordclient, debug);
      triggers.onMessage(discordclient, debug, this.reminderDAO);
    } 
    /**
     * Logs in to a discord bot with a token
     *
     * @since: 14-08-2018
     * @author: Bas Kager
     *
     * @returns {void}
     **/
    login() {
      debug("Loading Discord triggers");
      this.loadTriggers();
      debug("Authenticating the Discord bot");
      discordclient.login(config.bot.token);
    } 

    
  } // END OF CLASS
  return DiscordHelper;
}; // END OF FUNCTION
