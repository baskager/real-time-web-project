module.exports = {
  port: 3000,
  environment: "development",
  debug: {
    id: "remind-server"
  },
  db: {
    host: "localhost",
    name: "reminders",
    collections: {
      reminder: {
        name:"reminder"
      },
      person: {
        name: "person"
      },
      session: {
        name: "session"
      }
    },
    port: "8529",
    // For extra security, please create a seperate user in your arangodb instance (http://localhost:8529)
    user: "root",
    // The database password you have entered in the  "credentials.env" file
    password: "INSERT YOUR ARANGODB DATABASE PASSWORD HERE"
  },
  discord: {
    /* 
      Register an application in the Discord developer portal
      https://discordapp.com/developers/applications/ and copy
      the client id, client secret and bot token below.
    */
    clientId: "PASTE THE CLIENT ID FROM YOUR DISCORD DEVELOPERS PORTAL HERE",
    clientSecret: "PASTE THE CLIENT SECRET FROM THE DISCORD DEVELOPERS PORTAL HERE",
    bot: {
      token: "PASTE THE BOT TOKEN FROM THE DISCORD DEVELOPERS PORTAL HERE"
    },
    /* 
      Enter the verify endpoint URI below, the default configuration 
      works in development environments but not in production
    */
    redirectUri: "http://localhost:1511/verify",
    endpoints: {
      authorize: "https://discordapp.com/api/oauth2/authorize",
      token: "https://discordapp.com/api/oauth2/token",
      revoketoken: "https://discordapp.com/api/oauth2/token/revoke"
    },
  },
  cache: {
    location: "cache/",
    defaultFile: "default.json",
    save: true
  },
  session: {
    // Make up a session secret and enter it below to ensure session security
    secret: "PLEASE COME UP WITH A RANDOM SESSION SECRET AND ENTER IT HERE",
    name: "_reminderWebApp",
    resave: false,
    saveUninitialized: false,
  },
  redis: {
    host: "localhost", 
    port: 6379, 
    ttl: 86400
  }
};