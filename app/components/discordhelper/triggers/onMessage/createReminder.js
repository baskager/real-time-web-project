const { createErrorEmbed, createSuccessEmbed } = require("../helperFunctions"),
moment = require("moment");

module.exports = function createReminder(msg, debug, reminderDAO) {
  let error = false;

  // Check if 'to' is mentioned in the command
  if(msg.content.lastIndexOf(" to ") > -1) {
    // There can only be one mention (username) in the command
      if (msg.mentions.users.size === 1) {    
        // Get the mentioned user from the command message
        let mentionedUser = msg.mentions.users.values().next().value;

        // Slice the title out of the command message
        let title = msg.content.slice(msg.content.lastIndexOf(" to ") + " to ".length);
        title = title.charAt(0).toUpperCase() + title.slice(1);

        let duedate = null;
        // Check if the author indicated a due date
        if(title.lastIndexOf(" on ") > -1) {
          // Slice the due date out of the command message
          const dateInput = title.slice(title.lastIndexOf(" on ") + " on ".length);
          duedate = moment(dateInput, "DD-MM-YYYY");

          if(duedate.isValid()) {
            // Remove the date string from the title, as it has no place there
            let dateStringInTitle = msg.content.slice(msg.content.lastIndexOf(" on "));
            title = title.replace(dateStringInTitle, "");

            // Check if the entered due date is not in the past
            let timeDifference = duedate.diff(moment(), "days");
            if(timeDifference < 0) {
              error = true;
              msg.reply(createErrorEmbed("The given date ("+ dateInput +") is in the past"));
            }

          }
        }

        if(!error) createReminder(title, msg, mentionedUser, duedate);

      }
    } else {
      msg.reply(createErrorEmbed(
        "remind @username to [YOUR REMINDER] on [DUE DATE]",
        "Reminder could not understand that instruction, please use the following format:")
        );
    }
    
    function createReminder(title, msg, mentionedUser, duedate) {
      // debug(mentionedUser.id);
      reminderDAO.create(title, msg.author, mentionedUser.id, "DISCORDBOT", duedate).then(
        meta => {
          debug("Document saved:", meta._rev);

          // Reply with a success embedded message
          if(moment(duedate).isValid()) {
            msg.reply(createSuccessEmbed("reminding: " + mentionedUser.username + " to " + title + 
                                          " on " + moment(duedate).format("DD-MM-YYYY")));
          } else {
            msg.reply(createSuccessEmbed("reminding: " + mentionedUser.username + " to " + title));
          }
        },
        err => {
          debug("Failed to save document:", err);

          // Reply with an error embedded message
          msg.reply(createErrorEmbed("Please try reminding " + mentionedUser.username + " again"));
        }
      );
    }
};