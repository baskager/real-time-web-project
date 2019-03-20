/**
 * A Data Access Object for reminders
 *
 * @since: 20-03-2019
 * @author: Bas Kager
 */
const moment = require("moment");
module.exports = function(config, cache, environment, debug) {
  
  class ReminderDAO {
    /**
     * Constructor, initialises the Data Access Object
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     *
     * @returns {void}
     */
    constructor(db) {
      debug = debug.extend(this.constructor.name);
      this.db = db;
      this.collection = db.collection(config.name);
    }
    /**
     * creates a new reminder
     * 
     * @param {string} title Title of the reminder
     * @param {string} avatar The avatar URL of the author
     * @param {string} postedBy The author of the reminder
     * @param {string} timestamp The timestamp of when the reminder was created
     * @param {string} client The client from which the reminder was created
     * @param {string} due The due date for the reminder
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     *
     * @returns {void}
     **/
    create(title, avatar, postedBy, client, due) {
      debug("Creating new reminder: " + title);
      let doc = {
          title: title,
          avatar: avatar,
          postedBy: postedBy,
          timestamp: moment(),
          client,
          due
      };
  
      return this.collection.save(doc);
  }

    get(id) {
      debug("Not implemented yet");
    }

    getAll() {
      debug("Getting all reminders from database");
      return this.db.query("FOR r IN reminder SORT r.due DESC RETURN r").then(
        cursor => cursor.map(doc => doc)
      );
    }

    update(id) {
      debug("Not implemented yet");
    }

    delete(id) {
      debug("Not implemented yet");
    }

    
  } // END OF CLASS
  return ReminderDAO;
}; // END OF FUNCTION
