var mongoose = require("mongoose");
var Bugs = require("./Models/Bugs"); /* Imports the Bugs module. It contains the bug schema we need. */
mongoose.connect("mongodb://localhost:27017/test"); //Test is the database name.

var db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function(callback) {
   console.log("Connection Succeeded."); /* Once the database connection has succeeded, the code in db.once is executed. */
});

var Bug = mongoose.model("Bug", Bugs.bugSchema); //This creates the Bug model.

module.exports.Bug = Bug; /* Export the Bug model so index.js can access it. */
