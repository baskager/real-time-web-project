/**
 * A wrapper class for arango db 
 *
 * @since: 20-03-2019
 * @author: Bas Kager
 */

module.exports = function(config, cache, environment, debug) {
  
  class ArangoHelper {
    /**
     * Constructor, initialises the db connection
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     *
     * @returns {void}
     */
    constructor() {
      debug = debug.extend(this.constructor.name);
      this.db = require("arangojs")("http://" + config.host + ":" + config.port);
    }
    /**
     * Authenticates with the ArangoDB database
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     *
     * @returns {Object} Database object
     **/
    authenticate() {
      debug("Establishing connection with ArangoDB database: " + config.name);
      this.db.useBasicAuth(config.user, config.password);
      this.db.useDatabase(config.name);
      return this.db;
    } 

    
  } // END OF CLASS
  return ArangoHelper;
}; // END OF FUNCTION
