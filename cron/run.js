var mongoose = require('mongoose');
var secrets = require('../config/secrets');
var http = require("http");
var redis = require("redis");
var save = require("./save");

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});
redisClient = redis.createClient();
redisClient.on("error", function(err) {
  console.error("redis error "+ err);
});

exports.r = function(job) {

  console.log("running job.");
  job(mongoose, redisClient);
};


setInterval(function() {
  save.job(mongoose, redisClient);
}, 1000*60*3); // every three minutes

// mongoose.disconnect();
// redisClient.quit();
