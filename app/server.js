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
    discord = new components.DiscordHelper(reminderDAO);

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
discord.login();

app.get("/", function(req, res) {
    reminderDAO.getAll().then(
        docs => {
            res.render("home", {
                reminders: docs
            });
        },
        err => debug(err)
    ); 
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