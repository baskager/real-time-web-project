module.exports = function onReady(discordclient, debug) {
  debug("---- Loaded onReady trigger");
  // Resets this event listener because it can be reloaded when a socket connects
  discordclient.removeAllListeners("ready");

  discordclient.on("ready", () => {
    debug(`Discord connection established. Logged in as ${discordclient.user.tag}!`);
  });
};