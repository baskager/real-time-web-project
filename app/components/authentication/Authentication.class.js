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
    constructor(db, clients) {
      debug = debug.extend(this.constructor.name);
      this.db = db;
      this.clients = clients;

      this.sessionCollection = db.collection(config.collections.session.name);
      this.personCollection = db.collection(config.collections.person.name);
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
      const session_id = encodeURIComponent(crypto.createHash("sha256").update(session_base).digest("base64"));

      return this.store_session_id(remoteAddress, session_id);
    }
    /**
     * Verifies a session id by checking it against the database along with the users IP address
     *
     * @since: 01-04-2019
     * @author: Bas Kager
     * 
     * @param {string} remoteAddress The request IP address
     * @param {string} sessionId A session ID
     *
     * @returns {string} session id
     **/
    verify_session_id(remoteAddress, sessionId) {
      const doc = {
        remoteAddress: remoteAddress,
        session_id: sessionId
      };
      const self = this;
      return new Promise(function(resolve, reject) {
        self.sessionCollection.byExample(doc).then(
          docs => {
            debug(`Verifying session ID: ${sessionId}`);

            if( docs.count === 1) {
              debug(`VALID SESSION: ${sessionId}`);
              resolve(true);
            }
            else reject(new Error("Could not verify the session id"));
          },
          err => reject(err)
        );
      });
    }

    /**
     * Stores a session ID in the database
     *
     * @since: 01-04-2019
     * @author: Bas Kager
     * 
     * @param {string} remoteAddress The request IP address
     * @param {string} sessionId A session ID
     *
     * @returns {string} session id
     **/
    store_session_id(remoteAddress, session_id) {
      let doc = {
        remoteAddress: remoteAddress,
        session_id: session_id
      };

      return this.sessionCollection.save(doc, { returnNew: true });
    }

    /**
     * Stores an oauth2token and attaches it to a session ID, essentially creating a user account
     *
     * @since: 01-04-2019
     * @author: Bas Kager
     * 
     * @param {string} client The client of the user
     * @param {string} sessionId A session ID
     * @param {string} accessToken An oauth token from one of the clients
     * @param {string} refreshToken The token used for refreshing the access_token
     * @param {string} tokenType The type of token
     * @param {string} expires_in The amount of seconds that the access token expires
     *
     * @returns {Object} Database result of the new user
     **/
    createOauth2User(client, sessionId, accessToken, refreshToken, tokenType, expiresIn) {
      const self = this;
      return new Promise(function(resolve, reject) {
        const oauth2Client = self.clients[client];

        oauth2Client.getCurrentUser(tokenType, accessToken).then(
          result => {
            const user = JSON.parse(result);
            debug(`Current ${client} user: ${user}`);

            const doc = {
              username: user.username,
              email: user.email,
              client: client,
              avatar: user.avatar,
              remote_id: user.id,
              discriminator: user.discriminator,
              locale: user.locale,
              flags: user.flags,
              sessionId: sessionId,
              accessToken: accessToken,
              accesstokenExpiry: moment().add(expiresIn, "seconds"),
              refreshToken: refreshToken,
              tokenType: tokenType
            };

            debug(doc);

            resolve(self.personCollection.save(doc, { returnNew: true }));
  
          },
          error => reject(error)
        );

      });


      // let doc = {
      //   remoteAddress: remoteAddress,
      //   session_id: session_id
      // };

      // return this.sessionCollection.save(doc, { returnNew: true });
    }

    
  } // END OF CLASS
  return Authentication;
}; // END OF FUNCTION
