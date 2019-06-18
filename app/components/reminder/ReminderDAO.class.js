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
    create(title, author, mentionedUserId, client, due) {
      debug("Creating new reminder: " + title);
      let doc = {
          title: title,
          avatar: author.avatar,
          authorId: author.id,
          authorName: author.username,
          mentionedUserId: mentionedUserId,
          timestamp: moment(),
          client,
          due,
          deleted: null,
          updated: null
      };
  
      return this.collection.save(doc, { returnNew: true });
    }
    /**
     * Returns all reminders from the database
     *
     * @since: 02-05-2019
     * @author: Bas Kager
     * 
     * @param {string} client The oauth2 client
     * @param {string} id The remote user ID
     *
     * @returns {Promise} Promise containing the query results
     **/
    getByUserId(client, id) {
      debug("Getting all reminders for user ID:", id);
      return this.db.query(
          `FOR r IN reminder \
          FILTER r.mentionedUserId == '${id}' && r.client == '${client}' && r.deleted == null \
          SORT r.due DESC RETURN r`
        ).then(
        cursor => cursor.map(doc => doc)
      );
    }
    /**
     * Returns all reminders from the database
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     *
     * @returns {Promise} Promise containing the query results
     **/
    // getAll() {
    //   debug("Getting all reminders from database");
    //   return this.db.query("FOR r IN reminder SORT r.due DESC RETURN r").then(
    //     cursor => cursor.map(doc => doc)
    //   );
    // }
    /**
     * Updates a reminder
     *
     * @since: 20-03-2019
     * @author: Bas Kager
     * 
     * @param {string} id The oauth2 client
     * @param {Object} reminder (partial) reminder opbject
     *
     * @returns {Promise} Promise containing the query results
     **/
    update(id, reminder) {
      debug("Updating reminder:", id);
      return this.collection.update(id, reminder);
    }

    delete(id) {
      debug("Deleting reminder:", id);
      return this.collection.update(id, {deleted: moment()});
    }

    hardDelete(id) {
      debug("Hard deleting reminder:", id);
      return this.collection.remove(id);
    }

    
  } // END OF CLASS
  return ReminderDAO;
}; // END OF FUNCTION
