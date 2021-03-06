/**
 * GET /
 * Main controller, data page .
 */
Station = require("../models/Station");
// all stations (static data)
exports.index = function(req, res) {
  Station.find({}, function(err, docs) {
    res.send(JSON.stringify(docs));
  });
};

exports.nearby = function(req, res) {
  Station.find({
    location: {
      $nearSphere: {
        $geometry: {type: "Point", coordinates: [parseFloat(req.params["long"]), parseFloat(req.params["lat"])]},
        $minDistance: 500
      }
    }
  }, function(err, docs) {
    if (err != null) {
      res.send(JSON.stringify({"err": err}));
      return;
    }
    res.send(JSON.stringify(docs));
  });
};

exports.destinations = function(req, res) {
  Station.findOne({
    $query: {
      location: {
        $nearSphere: {
          $geometry: {type: "Point", coordinates: [parseFloat(req.params["long"]), parseFloat(req.params["lat"])]},
          $minDistance: 1500,
          $maxDistance: 5000
        }
      }
    },
    $orderby: {need: -1}
  }, function(err, docs) {
    if (err != null) {
      res.send(JSON.stringify({"err": err}));
      return;
    }
    res.send(JSON.stringify(docs));
  });
}

exports.top = function(req, res) {
  Station.find({
    $query: {},
    $orderby: {need:1},
    $limit: 99
  }, function(err, docs) {
    if (err != null) {
      res.send(JSON.stringify({"err": err}));
      return;
    }
    res.send(JSON.stringify(docs));
  });
}

/*
exports.geo = function(req, res) {

  Station.find({
      "location": {
        $nearSphere: {
          $geometry: {type:"Point", coordinates: [43 34]},
          $minDistance: 3000
        }
      }
    }, response);


}
*/
