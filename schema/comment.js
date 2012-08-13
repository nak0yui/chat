var
mongoose = require('mongoose'),
Schema = mongoose.Schema;

exports.schema = new Schema({
  time: Number,
  unixtime: Number,
  text: String,
  author: String,
  color: String
});

