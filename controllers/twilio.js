var twilio_credentials = require("../config/tcr.js");
var twilio = require('twilio')(twilio_credentials.account, twilio_credentials.secret);

var User = require("../models/User");
var Station = require("../models/Station");

var makeReply = function(text, res) {
  if (res) {
    res.header("content-type: text/xml");
  }
  r = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  r += "<Response><Message>"+text+"</Message></Response>";
  return r;
}



exports.makeReply = makeReply;

exports.sendSms = function(to, txt, callback) {

  twilio.messages.create({
    body: txt,
    to: to,
    from: '+441315101114'
  }, function(err, message) {
    console.log(err, message);
  });

/*  var message = {
    to: to,
    from: '+441315101114',
    body: txt
  };

  twilio.sendMessage(message, function(err, responseData) {
    if (err) return callback(err);
    callback(null, responseData);
  });*/
};
var sendSms = exports.sendSms;

exports.textHello = function(req, res) {
  var to = req.params['to'];
  sendSms(to, "hello world!", function(err, res) {
    console.log(err, res);
  });
}
exports.hint = function(req, res) {

    var from = req.body.From;
    var message = req.body.Body;

    var replyNotUser = function() {
      console.log("reply not user");
      sendSms(from, "Welcome to http://BorisBike.me. Register for free to start playing.", function(err, ok) { console.log(err, ok); });
        // res.send(makeReply("Welcome to BorisBike.me. To start playing, please create a free account.", res));
    };
    var replyUser = function(user) {

      if (user.credit >= 1) {
        Station.findOne({
          $query: {},
          $orderby: {need:1}
        }, function(err, docs) {
          if (err) { console.log("error retreiving hint"); return; }
          var text;
          if (data == null) {
            txt = "There's nothing we can tell you. Your hint credits are also untouched.";
          } else {
            user.credit = user.credit - 1;
            txt = "Go around " + docs.name +".";
          }
          console.log("sending " + txt);
          sendSms(from, txt, function(err, ok) { console.log(err, ok); });
          //res.send(makeReply(txt, res));
        });

      } else {
        var txt = "Sorry, you have insufficient hint credits. Top up at http://birisbike.me/get-credit";
        //res.send(makeReply(txt, res));
        sendSms(from,txt, function(err, ok) { console.log(err, ok); });
      }
    };

    // if there's a user, otherwise ask them to sign up
    User.findOne({phone: from}, function(err, data){
      if (err || data == null) { replyNotUser(); return; }
      replyUser(data);
    });

}
