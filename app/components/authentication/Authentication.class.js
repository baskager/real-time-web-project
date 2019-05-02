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
    generateSessionId(remoteAddress) {
      const session_base = moment().toString() + Math.random().toString();
      const session_id = encodeURIComponent(crypto.createHash("sha256").update(session_base).digest("base64"));

      return this.storeSessionid(remoteAddress, session_id);
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
    verifySessionId(remoteAddress, sessionId) {
      const doc = {
        remoteAddress: remoteAddress,
        session_id: sessionId
      };
      const self = this;
      return new Promise(function(resolve, reject) {
        self.sessionCollection.byExample(doc).then(
          docs => {

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
    storeSessionid(remoteAddress, session_id) {
      let doc = {
        remoteAddress: remoteAddress,
        session_id: session_id
      };

      return this.sessionCollection.save(doc, { returnNew: true });
    }

    /**
     * Fetches a user object using a remote ID
     *
     * @since: 02-05-2019
     * @author: Bas Kager
     * 
     * @param {string} client The oauth2 client
     * @param {string} id The remote user ID
     *
     * @returns {Promise} ArangoDB query result
     **/
    getUserById(client, id) {
      debug("Getting user with ID:", id);
      return this.db.query(`FOR p IN person FILTER p.remoteId == '${id}' && p.client == '${client}' RETURN p`).then(
        cursor => cursor.map(doc => doc)
      );
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

            const doc = {
              username: user.username,
              email: user.email,
              client: client,
              avatar: user.avatar,
              remoteId: user.id,
              discriminator: user.discriminator,
              locale: user.locale,
              flags: user.flags,
              sessionId: sessionId,
              accessToken: accessToken,
              accesstokenExpiry: moment().add(expiresIn, "seconds"),
              refreshToken: refreshToken,
              tokenType: tokenType
            };

            return doc;
  
          },
          error => reject(error)
        ).then(
          remoteUser => {
            // Check if the user already has an account with us
            self.getUserById(client, remoteUser.remoteId).then(
              result => {
                if(result[0]) resolve(result[0]);
                else resolve(self.personCollection.save(remoteUser, { returnNew: true }));
              },
              error => reject(error)
            );
          },
          error => reject(error)
        );

      });
    }

    
  } // END OF CLASS
  return Authentication;
}; // END OF FUNCTION
