const express = require("express"),
    app = express(),
    http = require("http").Server(app),
    debug = require("debug")("remind-server"),
    io = require("socket.io")(http),
    handlebars  = require("express-handlebars"),
    config = require("./config"),
    port = config.port || 3000,
    db = require("arangojs")();

db.useBasicAuth(config.db.user, config.db.password);
db.useDatabase(config.db.name);
const collection = db.collection("chat");

app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Define directory from which static files are served
app.use(express.static("public"));

app.get("/reminders", function(req, res) {
    res.render("reminders");
});


app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    debug("A user connected");
    io.emit("chat message", "Server: You are connected");

    collection.all().then(
        cursor => cursor.map(doc => doc)
    ).then(
        docs => {
            for(let doc of docs.reverse()) {
                io.emit("chat message", doc.message);
            }
        },
        err => io.emit("chat message", "Loading chat history failed: " + err.message)
    ); 

    socket.on("chat message", function(msg){
        debug(socket.handshake.address + ": " + msg);
        let doc = {
            timestamp: new Date(),
            message: msg
        };
        collection.save(doc).then(
            () => io.emit("chat message", doc.message),
            err =>  io.emit("chat message", "Failed to send message. Error: " + err)
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