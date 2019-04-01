/**
 * A class that handles authentication
 *
 * @since: 01-04-2019
 * @author: Bas Kager
 */
const moment = require("moment"),
crypto = require("crypto");
module.exports = function(config, cache, environment, debug) {
  
  class Authentication {
    /**
     * Constructor, initialises the db connection
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     * 
     * @param {Object} db The ArangoDB database object
     *
     * @returns {void}
     */
    constructor(db) {
      debug = debug.extend(this.constructor.name);
      this.db = db;

      this.sessionCollection = db.collection(config.collections.session.name);
    }
    /**
     * Generates a new random session id
     *
     * @since: 01-04-2019
     * @author: Bas Kager
     * 
     * @param {string} remoteAddress The request IP address
     *
     * @returns {string} session id
     **/
    generate_session_id(remoteAddress) {
      const session_base = moment().toString() + Math.random().toString();
      const session_id = crypto.createHash("sha256").update(session_base).digest("base64");

      return this.store_session_id(remoteAddress, session_id);
    }

    verify_session_id(remoteAddress, session_id) {
      const doc = {
        remoteAddress: remoteAddress,
        session_id: session_id
      };
      const self = this;
      return new Promise(function(resolve, reject) {
        self.sessionCollection.byExample(doc).then(
          docs => {
            debug("Verifying session id " + session_id);

            debug(docs.count);

            if( docs.count === 1) resolve(true);
            else reject(new Error("Could not verify the session id"));
          },
          err => reject(err)
        );
      });
    }

    store_session_id(remoteAddress, session_id) {
      let doc = {
        remoteAddress: remoteAddress,
        session_id: session_id
      };

      return this.sessionCollection.save(doc, { returnNew: true });
    }

    
  } // END OF CLASS
  return Authentication;
}; // END OF FUNCTION
