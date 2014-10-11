var mongoose = require('mongoose');
var secrets = require('../config/secrets');
var http = require("http");
var redis = require("redis");


// calls callback(error, null) or callback(null, body_as_string)
exports.fetchUrl = function(url, callback) {
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
}

exports.r = function(job) {
  mongoose.connect(secrets.db);
  mongoose.connection.on('error', function() {
    console.error('MongoDB Connection Error. Make sure MongoDB is running.');
  });
  redisClient = redis.createClient();
  redisClient.on("error", function(err) {
    console.error("redis error "+ err);
  });
  console.log("running job.");
  job(mongoose, redisClient);
//  mongoose.disconnect();
//  redisClient.quit();
};
