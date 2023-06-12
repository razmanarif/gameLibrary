const mongoose = require('mongoose')
const Schema = mongoose.Schema

const consoleSchema = new Schema({
   name: {
    type: String,
    required: true,
   },
   manufacturer: {
    type: String,
    required: true,
   },
   dateBought: {
    type: Date,
    required: true,
   },
   games: [{
    gameName: {type: String, required: true},
    dateBoughtGame: {type: Date, required: true},
    gamePrice: {type: Number, required: true},
    isCompleted: {type: Boolean},
    hoursPlayed: {type: Number, required: true}
   }]
});

const consoleModel = mongoose.model("ConsoleModel", consoleSchema)

module.exports = consoleModel
