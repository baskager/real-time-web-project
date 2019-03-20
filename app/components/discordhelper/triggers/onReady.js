module.exports = function onReady(discordclient, debug) {
  debug("---- Loaded onReady trigger");
  discordclient.on("ready", () => {
    debug(`Discord connection established. Logged in as ${discordclient.user.tag}!`);
  });
};