/**
 * Function that loads custom libraries
 *
 * @since: 12-08-2018
 * @author: Bas Kager
 */
module.exports = function(config) {
  const Cache = require("./cache/Cache.class")(config.cache);
  let cache = new Cache();
  let environment = config.environment;
  return {
    cache: cache
  };
};
