const { RichEmbed } = require("discord.js");

exports.createErrorEmbed = function(description, title) {
  return new RichEmbed()
  // Set the title of the field
  .setTitle(title || "Something went wrong")
  // Set the color of the embed
  .setColor(0xFF0000)
  // Set the main content of the embed
  .setDescription(description);
};

exports.createSuccessEmbed = function(description, title) {
  return new RichEmbed()
  // Set the title of the field
  .setTitle(title || "Great success")
  // Set the color of the embed
  .setColor(0x00FF00)
  // Set the main content of the embed
  .setDescription(description);
};