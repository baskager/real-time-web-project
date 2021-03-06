module.exports = function onMessage(discordclient, debug, reminderDAO, socket) {
  debug("---- Loaded onMessage trigger");
  // Resets this event listener because it can be reloaded when a socket connects
  discordclient.removeAllListeners("message");

  discordclient.on("message", msg => {
    // Check for the 'remind' command and if the author is not a bot
    if( msg.content.substr(0,7).toLowerCase() === "!remind" && msg.author.bot === false) {
        
      // Load all the commands here
        require("./createReminder")(msg, debug, reminderDAO, socket);

    }
});
};