var mongoose = require('mongoose');

var stationSchema = new mongoose.Schema({
  terminalName: { type: String, unique: true, lowercase: true },
  name: String,
  location: {type: [Number], index: '2dsphere'},
  lat: Number,
  long: Number,
  installed: Boolean,
  locked: Boolean,
  nbDocks: Number,
  threshold: Array
});

module.exports = mongoose.model('Station', stationSchema);
