/**
 * Function that loads custom libraries, feeds library with the relevant config, environment and debugger.
 *
 * @since: 20-03-2019
 * @author: Bas Kager
 */
module.exports = function(config, debug) {
  const Cache = require("./cache/Cache.class")(config.cache);
  let cache = new Cache();
  let environment = config.environment;
  return {
    DiscordHelper: require("./discordhelper/DiscordHelper.class")(config.discord, cache, environment, debug),
    ArangoHelper: require("./arangohelper/ArangoHelper.class")(config.db, cache, environment, debug),
    Authentication: require("./authentication/Authentication.class")(config.db, cache, environment, debug),
    ReminderDAO: require("./reminder/ReminderDAO.class")(config.db.collections.reminder, cache, environment, debug),
    cache: cache
  };
};
