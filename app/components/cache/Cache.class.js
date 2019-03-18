/**
 * Caching library that caches data for various software components
 *
 * @author  Bas Kager
 * @version 1.0
 */
const fs = require("fs");
module.exports = function(config) {
  class Cache {
    /**
     * Constructor for the Cache class
     *
     * Reads cache from file, if cache is not available,
     * initialise an empty cache object
     *
     * @since: 12-08-2018
     * @author: Bas Kager
     *
     * @returns {void}
     */
    constructor() {
      let cacheFromFile = this.readFromFile();
      if (cacheFromFile) {
        console.info(
          " " +
            Object.keys(cacheFromFile).length +
            " components are cached, initialising cache..."
        );
        this.components = cacheFromFile;
      } else {
        console.info(
          "No cache is available, starting server with empty cache..."
        );
        this.components = {};
      }
    }
    /**
     * Get cache item for a component
     *
     * @since: 12-08-2018
     * @author: Bas Kager
     *
     * @param {string} componentName - Name of the cached component
     * @param {string} id - Unique identifier of the cached object
     *
     * @returns {Object} - Cached javascript object
     */
    get(componentName, id) {
      if (
        this.components[componentName] &&
        this.components[componentName][id]
      ) {
        return this.components[componentName][id];
      } else return null;
    }
    /**
     * Get the entire cache object
     *
     * @since: 12-08-2018
     * @author: Bas Kager
     *
     * @returns {Object} - Cache object
     */
    getAll() {
      return this.components;
    }
    /**
     * Reads cache from a file
     *
     * @since: 12-08-2018
     * @author: Bas Kager
     *
     * @returns {Object} - Cache object
     */
    readFromFile(fileName = config.defaultFile) {
      const path = config.location + fileName;
      console.info("Reading cache from: " + path);
      if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, "utf8"));
      } else return null;
    }
    /**
     * Saves cache to a file
     *
     * @since: 12-08-2018
     * @author: Bas Kager
     *
     * @returns {void}
     */
    saveToFile(fileName = config.defaultFile) {
      const path = config.location + fileName;
      console.info("Writing cache to: " + path);

      fs.writeFile(path, JSON.stringify(this.components), "utf8", err => {
        if (err) throw err;
        console.info("Cache written to: " + path);
      });
    }
    /**
     * Add an item to the cache object
     *
     * @since: 12-08-2018
     * @author: Bas Kager
     *
     * @returns {void}
     */
    add(componentName, id, data) {
      // Create cache entry if it doesn't exist yet
      if (!this.components[componentName]) this.components[componentName] = {};

      this.components[componentName][id] = data;
    }
  } // END OF CLASS

  return Cache;
}; // END OF FUNCTION
