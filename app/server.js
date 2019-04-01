const express = require("express"),
    app = express(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    exphbs = require("express-handlebars"),
    config = require("./config"),
    debug = require("debug")(config.debug.id),
    port = config.port || 3000,
    moment = require("moment"),
    components = require("./components")(config, debug),
    arangoHelper = new components.ArangoHelper(),
    db = arangoHelper.authenticate(),
    reminderDAO = new components.ReminderDAO(db),
    discord = new components.DiscordHelper(reminderDAO),
    authclients = {
        discord: discord
    },
    auth = new components.Authentication(db, authclients),
    NodeSession = require("node-session");

    const Discord = require("discord.js"),
    discordclient = new Discord.Client();
    
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

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

// Define directory from which static files are served
app.use(express.static("public"));
app.use(express.json());
app.io = io;

// Enable discord bot functinality
discord.loginBot();

app.get("/", function(req, res) {
    res.writeHead(302, {"Location": "/login"});
    res.end();
});

app.get("/login", function(req, res) {
    auth.generate_session_id(req.connection.remoteAddress).then(
        result => res.render("login", {session_id: result.new.session_id, redirectUri: config.discord.redirectUri}),
        err => res.render("login", {error: err, session_generate_error: true})
    );
});

app.get("/verify", function(req, res) {
    const session_id = encodeURIComponent(req.query.state);

    if(req.query.code && session_id) {
        // Verify the session ID that was passed along by the Discord authorization prompt, this prevents CSFR attacks.
        auth.verify_session_id(req.connection.remoteAddress, session_id).then(
            () => {
                // Echange the (one-time) code received by the Discord authorization prompt for an Access Token.
                return discord.exchangeAccessToken(req.query.code);
            },
            // If the session ID could not be verified, send the client back to the login page along with the error
            err => res.render("login", {error: err, session_invalid_error: true})
        ).then(
            // Received a response upon exchanging the one-time code for an access token
            tokenExchangeResult => {
                const tokens = JSON.parse(tokenExchangeResult);
                if(tokenExchangeResult) {
                    auth.createOauth2User("discord", session_id,tokens.access_token, tokens.refresh_token, 
                        tokens.token_type, tokens.expires_in);

                    reminderDAO.getAll().then(
                        docs => res.render("home", {reminders: docs}),
                        err => debug(err)
                    ); 
                }
            },
            err => res.render("login", {error: err, oauth_invalid_error: true})
        );
    } else {
        res.writeHead(302, {"Location": "/login"});
        res.end();
    }
});

io.on("connection", function(socket) {
    debug("A client connected through socket: " + socket.id);
    app.post("/webhook/create", function(req, res) {
        reminderDAO.create(req.body.title, req.body.avatar, req.body.postedBy, "webhook", req.body.due).then(
            meta => {
                debug("Document saved:", meta._rev);
                
                // req.app.io.emit("reminder", doc);
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

// reminderDAO.getAll().then(
//     docs => {
//         res.render("home", {
//             reminders: docs
//         });
//     },
//     err => debug(err)
// ); 