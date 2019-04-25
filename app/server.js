
const express = require("express");
const session = require("express-session");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const exphbs = require("express-handlebars");
const config = require("./config");
const redis = require("redis");
const redisClient = redis.createClient();
const redisStore = require("connect-redis")(session);

let debug = require("debug")(config.debug.id);
const port = config.port || 3000;
const moment = require("moment");
const components = require("./components")(config, debug);
const arangoHelper = new components.ArangoHelper();
const db = arangoHelper.authenticate();
const reminderDAO = new components.ReminderDAO(db);
const discord = new components.DiscordHelper(reminderDAO);
const authclients = {
    discord: discord
};
const auth = new components.Authentication(db, authclients);

redisClient.on("error", (err) => {
    console.log("Redis error: ", err);
});

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

// Set environment security based on the environment the server runs in
let secure = true;
if(config.environment === "development") secure = false;

app.use(session({
    secret: config.session.secret,
    name: config.session.name,
    saveUninitialized: config.session.saveUninitialized,
    resave: config.session.resave,
    cookie: {secure: secure},
    store: new redisStore({ 
        host: config.redis.host, 
        port: 6379, 
        client: redisClient,
        ttl: config.redis.ttl 
    })
}));

// Enable discord bot functinality
discord.loginBot();

app.get("/", function(req, res) {
    if(req.session.user) {
        const user = req.session.user;

        // auth.getUserById("discord", user.remoteId).then(
        //     docs => {
        //         if(! docs[0]) req.session.user = null;
        //     },
        //     err => debug(err)
        // ); 

        reminderDAO.getByUserId(req.session.user.remoteId).then(
            docs => {
                res.render("home", {
                    user: user,
                    reminders: docs
                });
            },
            err => debug(err)
        ); 
    } else {
        res.writeHead(302, {"Location": "/login"});
        res.end();
    }
});

app.get("/login", function(req, res) {
    if(req.session.user) {
        res.writeHead(302, {"Location": "/"});
        res.end();
    } else {
        auth.generateSessionId(req.connection.remoteAddress).then(
            result => res.render("login", {session_id: result.new.session_id, redirectUri: config.discord.redirectUri}),
            err => res.render("login", {error: err, session_generate_error: true})
        );
    }
});

app.get("/logout", function(req, res) {
    req.session.user = null;
    res.writeHead(302, {"Location": "/login"});
    res.end();
});

app.get("/verify", function(req, res) {
    const sessionId = encodeURIComponent(req.query.state);

    if(req.query.code && sessionId) {
        // Verify the session ID that was passed along by the Discord authorization prompt, this prevents CSFR attacks.
        auth.verifySessionId(req.connection.remoteAddress, sessionId).then(
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
                    return auth.createOauth2User("discord", sessionId,tokens.access_token, tokens.refresh_token, 
                        tokens.token_type, tokens.expires_in);
                } else res.render("login", {error: null, no_response_error: true});
            },
            err => res.render("login", {error: err, oauth_invalid_error: true})
        ).then(
            // The user was created succesfully
            user => {
                if(user.new) req.session.user = user.new;
                else if(user) req.session.user = user;
                // res.render("verify", {session_id: sessionId});
                res.writeHead(302, {"Location": "/"});
                res.end();
            },
            err => res.render("login", {error: err, user_creation_error: true})
        );
    } else {
        res.writeHead(302, {"Location": "/login"});
        res.end();
    }
});

io.on("connection", function(socket) {
    debug("A client connected through socket: " + socket.id);

    socket.on("verify", function(sessionId){
        debug("Verifying session id: ", sessionId);
    });

    app.post("/webhook/create", function(req, res) {
        reminderDAO.create(req.body.title, req.body.avatar, req.body.postedBy, "webhook", req.body.due).then(
            meta => {
                debug("Document saved:", meta._rev);
                req.app.io.emit("reminder", meta);
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
    console.log("Server listening on port", port, "on", config.environment, "configuration. Secure is set to:", secure);
});

// reminderDAO.getAll().then(
//     docs => {
//         res.render("home", {
//             reminders: docs
//         });
//     },
//     err => debug(err)
// ); 