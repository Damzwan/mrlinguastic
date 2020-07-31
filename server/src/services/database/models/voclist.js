const mongoose = require("mongoose");
const mongo = require("../mongo");
const Schema = mongoose.Schema;
const voclist = new Schema({
    title: { type: String, required: true},
    from: {type: String, required: true},
    to: {type: String, required: true},
    words: {type: [Object], required: false} 
})

module.exports = mongoose.model('Voclist', voclist)