var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bugSchema = new Schema({ //This is where bugSchema is defined.
     bugName: String,
     bugColour: String,
     Genus: String
});

module.exports.bugSchema = bugSchema; //Export bugSchema so that models.js can access it.
