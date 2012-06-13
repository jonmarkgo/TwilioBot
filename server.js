/*jslint unparam: true, node: true, sloppy: true, nomen: true, maxerr: 50, indent: 2 */
var express = require('express'), app = express.createServer(), net = require('net'), twilioAPI = require('twilio-api');

var cli = new twilioAPI.Client(process.env.account_sid, process.env.auth_token);

app.use(cli.middleware());
app.listen(8002);

var arduinoTcp = null;
var curr_call = null;

var tcpServer = net.createServer(function (socket) {
  console.log('tcp server running on port 1337');
});

function getDigits(call, input) {
  console.log('pressed ' + input);
  if (arduinoTcp === null) {
    call.say("I can't do that for you, Hal. I'm offline.");
  } else {
	curr_call = call;
	if (['2', '4', '5', '6', '8', '0'].indexOf(input) >= 0) {
	  arduinoTcp.write(input);
	  call.gather(getDigits, {numDigits: 1});
	} else {
	  call.gather(getDigits, {numDigits: 1}).say("I can't do that for you, Hal. Invalid command.");
	}
  }
}

tcpServer.on('connection', function (socket) {
  console.log('num of connections on port 1337: ' + tcpServer.connections);
  arduinoTcp = socket;

  socket.on('data', function (mydata) {
    console.log('received on tcp socket:' + mydata);
    curr_call.load(function (err, call) {
      if (err) {
        throw err;
      }
      if (!isNaN(mydata)) {
        curr_call = call;
        call.liveCb(function (err, subcall) {
          if (err) {
            throw err;
          }
          subcall.gather(getDigits, {numDigits: 1}).say(mydata + " inches");
        });
      }
    });
  });
});
tcpServer.listen(1337);

var twilio_app = cli.account.getApplication(process.env.app_sid, function (err, app) {
  if (err) {
    throw err;
  }
  app.register();
  app.on('incomingCall', function (call) {
    if (arduinoTcp === null) {
      call.say("I can't do that for you, Hal. I'm offline.");
    } else {
      curr_call = call;
      call.gather(getDigits, {numDigits: 1}).say("Drive me using your dial pad.");
    }
  });
});
