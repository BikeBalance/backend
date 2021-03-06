var http = require("http");
var xml2js = require("xml2js");
var Station = require("../models/Station");
var funcs = require("../models/func");
var DATA_URL = "http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml";

// calls callback(error, null) or callback(null, body_as_string)
var fetchUrl = function(url, callback) {
  http.get(url, function(res) {
    if (res.statusCode != 200) {
      callback("weird status code: " + res.statusCode);
      return;
    }

    res.setEncoding('utf8');
    var body = "";
    res.on("data", function(chunk) {
      body += chunk;
    });
    res.on("end", function() { callback(null, body); });
  }).on('error', function(e) {
    callback("Got error: " + e.message);
  });
};

exports.job = function(db, redis) {

  // assumes three samples per day, 7 per week.
  addIfNeeded = function(station) {
    Station.find({"terminalName": station.terminalName}, function(err, res) {
        Station.where({"terminalName": station.terminalName}).findOne(function(err, obj) {
          if (err != null) { console.log("mongo error. "); return; }

          var bikes = parseInt(station.nbBikes);
          var docks = parseInt(station.nbDocks);

          if (obj) {
            obj.nbBikes = bikes;
            obj.nbDocks = docks;
            obj.need = funcs.need(bikes, docks, 0.6);
            obj.save(function(err) { console.log((new Date()) + " updated model " + obj.terminalName); })
            return;
          }

          md = {
            name: station.name,
            terminalName: station.terminalName,
            location: [parseFloat(station.long), parseFloat(station.lat)],
            long: parseFloat(station.long),
            lat: parseFloat(station.lat),
            installed: station.installed,
            locked: station.locked,
            nbBikes: parseInt(station.nbBikes),
            need: funcs.need(bikes, docks, 0.6),
            nbDocks: parseInt(station.nbDocks),
            threshold: [0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5],
          };
        var model = new Station(md);
        model.save(function(err) { console.log((new Date()) + " saved model " + md.terminalName + " err = " + err)});
      });
    });
  };


  fetchUrl(DATA_URL, function(err, data) {
    if (err) {
      console.log(err);
      return;
    }

    var parser = new xml2js.Parser();
    parser.parseString(data, function(err, json) {
      if (err) {
        console.log((new Date() )+ "Error parsing xml.");
        return;
      }

      var lastUpdate = parseInt(json.stations["$"].lastUpdate);

      redis.get("last_update", function(err, lupd) {
        if (err != null) { console.log((new Date()) + "redis error."); return; }
        if (lupd != null && parseInt(lupd) >= lastUpdate) {
          console.log((new Date()) + "Already updated."); return;
        }

        // update
        //var stats = [];
        var stations = json.stations.station;
        for (s in stations) {
          addIfNeeded(stations[s]);
          redis.set(stations[s].terminalName, stations[s].nbBikes);
        }
        redis.set("last_update", lastUpdate);
        console.log((new Date()) + "Update done.")
      });
    });
  });
};
