/**
 * A wrapper class for discord.js 
 *
 * @since: 20-03-2019
 * @author: Bas Kager
 */
const Discord = require("discord.js"),
discordclient = new Discord.Client(),
triggers = require("./triggers"),
request = require("request-promise-native");

module.exports = function(config, cache, environment, debug) {
  
  class DiscordHelper {
    /**
     * Constructor, initialises the connection with discord
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     *
     * @param {Object} reminderDAO The Data Access Object for reminders
     *
     * @returns {void}
     */
    constructor(reminderDAO) {
      debug = debug.extend(this.constructor.name);
      this.reminderDAO = reminderDAO;
    }
    /**
     * Loads the triggers that define the interaction between discord and this application
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     *
     * @returns {void}
     **/
    loadTriggers() {
      triggers.onReady(discordclient, debug);
      triggers.onMessage(discordclient, debug, this.reminderDAO);
    } 

    /**
     * Exchanges a code from the discord authorization grant for an access token.
     * 
     * @param {string} authcode Code from the discord authorization grant
     *
     * @since: 01-04-2019
     * @author: Bas Kager
     *
     * @returns {void}
     **/
    exchangeAccessToken(authCode) {
      const formdata = {form: {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: config.redirectUri,
        scope: "identity email guilds"
      }};

      return request.post(config.endpoints.token, formdata);
    }
    /**
     * Gets the user currently logged in through the Discord API
     * 
     * @param {string} tokenType The type of the token
     * @param {string} accessToken The access token given out by discord
     *
     * @since: 01-04-2019
     * @author: Bas Kager
     *
     * @returns {void}
     **/
    getCurrentUser(tokenType, accessToken) {
      const options = {
        url: "https://discordapp.com/api/users/@me",
        headers: {
          authorization:`${tokenType} ${accessToken}` 
        }
      };

      console.dir(options);

      return request.get(options);
    }
    /**
     * Logs in to a discord bot with a token
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     *
     * @returns {void}
     **/
    loginBot() {
      debug("Loading Discord triggers");
      this.loadTriggers();
      debug("Authenticating the Discord bot");
      discordclient.login(config.bot.token);
    } 

    
  } // END OF CLASS
  return DiscordHelper;
}; // END OF FUNCTION
