/**
 * GET /
 * Main controller, data page .
 */
station = require("../models/Station");
// all stations (static data)
exports.index = function(req, res) {
  station.find({}, function(err, docs) {
    res.send(JSON.stringify(docs));
  });
};
