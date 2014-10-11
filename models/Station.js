var mongoose = require('mongoose');

var stationSchema = new mongoose.Schema({
  name: { type: String, unique: true, lowercase: true },
  stationName: String,
  lat: Number,
  long: Number,
  installed: Boolean,
  locked: Boolean,
  threshold: Array
});

module.exports = mongoose.model('Station', stationSchema);
