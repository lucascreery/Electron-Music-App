var mongoose = require('mongoose');

var songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  filename: String
})

module.exports = mongoose.model('Song', songSchema)