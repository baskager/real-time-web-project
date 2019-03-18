const express = require("express"),
    app = express(),
    http = require("http").Server(app),
    debug = require("debug")("remind-server"),
    io = require("socket.io")(http),
    exphbs = require("express-handlebars"),
    config = require("./config"),
    port = config.port || 3000,
    db = require("arangojs")("http://" + config.db.host + ":" + config.db.port),
    moment = require("moment"),
    { Client, RichEmbed } = require("discord.js"),
    discordclient = new Client();

function createReminder(title, avatar, postedBy, client, due) {
    let doc = {
        title: title,
        avatar: avatar,
        postedBy: postedBy,
        timestamp: moment(),
        client,
        due
    };

    return collection.save(doc);
}

discordclient.on("ready", () => {
  console.log(`Logged in as ${discordclient.user.tag}!`);
});

discordclient.on("message", msg => {
    console.dir(msg.content.indexOf("to") !== 0);
    if( msg.content.substr(0,6) === "remind" && 
        msg.author.bot === false &&
        msg.content.indexOf("to") !== 0) {
        if (msg.mentions.users.size === 1) {    
                    let mentionedUser = msg.mentions.users.values().next().value;

                    let reminder = msg.content.slice(msg.content.indexOf("to ") + "to ".length);
                    reminder = reminder.charAt(0).toUpperCase() + reminder.slice(1);
                    
                    console.log(reminder);

                    createReminder(reminder, msg.author.avatarURL, mentionedUser.username, "DISCORDBOT", "23-03-2019").then(
                        meta => {
                            debug("Document saved:", meta._rev);

                            const embed = new RichEmbed()
                            // Set the title of the field
                            .setTitle("Great success!")
                            // Set the color of the embed
                            .setColor(0x00FF00)
                            // Set the main content of the embed
                            .setDescription("reminding: " + mentionedUser.username + " to " + reminder);

                            // Send the embed to the same channel as the message
                            msg.reply(embed);
                        },
                        err => {
                            debug("Failed to save document:", err);

                            const embed = new RichEmbed()
                            // Set the title of the field
                            .setTitle("There was an unexpected error")
                            // Set the color of the embed
                            .setColor(0xFF0000)
                            // Set the main content of the embed
                            .setDescription("Please try reminding " + mentionedUser.username + " again");
                            // Send the embed to the same channel as the message
                            msg.reply(embed);
                        }
                    );
        } else {
            const embed = new RichEmbed()
            // Set the title of the field
            .setTitle("Reminder could not understand that instruction, please use the following format:")
            // Set the color of the embed
            .setColor(0xFF0000)
            // Set the main content of the embed
            .setDescription("remind @username to [YOUR REMINDER] on [DUE DATE]");
            // Send the embed to the same channel as the message
            msg.reply(embed);
        }
    }
    
    // console.dir(msg.mentions.users.values().next());
    // if (msg.content.substr(0,6) === "remind") { 
    //     msg.reply("Reminding ");
    // }
});

discordclient.login(config.discord.bot.token);

const handlebars = exphbs.create({
    helpers: {
        // Allows comparing two values, like if(a===b)
        equal: function(a, b, options) {
            if (a === b) {
                return options.fn(this);
            }
            return options.inverse(this);
        },
        formatDate: function(date) {
            return moment(date).format("DD-MM-YYYY");
        }
    },
    defaultLayout: "main"
});
db.useBasicAuth(config.db.user, config.db.password);
db.useDatabase(config.db.name);

const collection = db.collection("reminder");

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

// Define directory from which static files are served
app.use(express.static("public"));
app.use(express.json());
app.io = io;

app.get("/", function(req, res) {
    db.query("FOR r IN reminder SORT r.timestamp DESC RETURN r").then(
        cursor => cursor.map(doc => doc)
    ).then(
        docs => {
            res.render("home", {
                reminders: docs
            });
        },
        err => debug(err)
    ); 
});

io.on("connection", function(socket) {
    debug("A user connected");
    app.post("/webhook/create", function(req, res) {
        let doc = {
            title: req.body.title,
            avatar: req.body.avatar,
            postedBy: req.body.postedBy,
            timestamp: moment()
        };
	
        collection.save(doc).then(
            meta => {
                debug("Document saved:", meta._rev);
                
                req.app.io.emit("reminder", doc);
                res.status(200).send();
            },
            err => {
                debug("Failed to save document:", err);
                res.status(500).send();
            }
        );

    });

    socket.on("disconnect", function(){
        debug("A user disconnected");
    });
});

app.get("/chat", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

// app.get("/createdb", function(req, res) {
//     debug("creating new database");
//     debug(db);

//     db.createDatabase("reminders").then(  () => {
//         debug("database created");
//         res.send("success");
//     }, err => {
//         debug("Failed to create database: " + err);
//         res.send("failed");
//     });

// });

// app.get("/createcollection", function(req, res) {
//     collection.create().then(
//         () => console.log("Collection created"),
//         err => console.error("Failed to create collection: ", err)
//     );

//     res.send(db);
// });

http.listen(port, function(){
    console.log("Server listening on port " + port);
});