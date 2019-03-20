module.exports = function onMessage(discordclient, debug, reminderDAO) {
  debug("---- Loaded onMessage trigger");

  discordclient.on("message", msg => {
    // Check for the 'remind' command and if the author is not a bot
    if( msg.content.substr(0,6).toLowerCase() === "remind" && msg.author.bot === false) {
        
      
      // Load all the commands here
        require("./createReminder")(msg, debug, reminderDAO);


    }
});
};