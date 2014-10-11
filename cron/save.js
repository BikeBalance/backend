var http = require("http");
var xml2js = require("xml2js");
var r = require('./run.js');
var Station = require("../models/Station");

var DATA_URL = "http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml";

r.r(function(db, redis) {


  // assumes three samples per day, 7 per week.
  addIfNeeded = function(station) {
    console.log("add if needed...");
    Station.find({"terminalName": station.terminalName}, function(err, res) {
        Station.where({"terminalName": station.terminalName}).findOne(function(err, obj) {
          if (err != null) { console.log("mongo error. "); return; }
          if (obj) {
            console.log(" no update in mongo. ");
            return;
          }
      //    console.log(station);
          md = {
            name: station.name,
            terminalName: station.terminalName,
            location: [parseFloat(station.long), parseFloat(station.lat)],
            long: parseFloat(station.long),
            lat: parseFloat(station.lat),
            installed: station.installed,
            locked: station.locked,
            nbDocks: parseInt(station.nbDocks),
            threshold: [0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5,
                        0.5, 0.5, 0.5],
          };
        //  console.log("MD=");
          //console.log(md);
        var model = new Station(md);
        model.save(function(err) { console.log((new Date()) + " saved model. RESULTING ERROR  (null means ok) = " + err)});
      });
    });
  };


  r.fetchUrl(DATA_URL, function(err, data) {
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
});
