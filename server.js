var express = require('express'),
    app = express.createServer(),
    net = require('net');
var twilioAPI = require('twilio-api'),
    cli = new twilioAPI.Client(process.env.account_sid, process.env.auth_token);
app.use(cli.middleware() );
app.listen(8002);

var arduinoTcp = null;
var curr_call = null;
var tcpServer = net.createServer(function (socket) {
  console.log('tcp server running on port 1337');
});

tcpServer.on('connection',function(socket){
  // socket.write('connected to the tcp server\r\n');
    console.log('num of connections on port 1337: ' + tcpServer.connections);
    
    arduinoTcp = socket;
    
    socket.on('data',function(mydata){

        console.log('received on tcp socket:'+mydata);
       curr_call.load(function(err,call) {
       	if (mydata != '2OK' && mydata != '8OK') {
       		curr_call = call;
       		 call.liveCb(function(err,subcall) {
       		 	subcall.gather(getDigits, {numDigits: 1}).say(mydata + " inches");
       		 });
       	}
        });
        //socket.write('msg received\r\n');
        //    io.sockets.emit('tcpreply',{reply:mydata + ''});
        }
    );
});
tcpServer.listen(1337);


//Get a Twilio application and register it
function getDigits(call,input) {
	   console.log('pressed ' + input);
      arduinoTcp.write(input);
      curr_call = call;
    call.gather(getDigits, {numDigits: 1});

  /*twilio_app.listCalls({}, function(err,li) {
console.log(li);
   });*/
      }
   
      function saySonar(err,call) {
      	call.say('10 inches');
      }
var twilio_app = cli.account.getApplication(process.env.app_sid, function(err, app) {
    if(err) throw err;
    app.register();
    app.on('incomingCall', function(call) {
    	if (arduinoTcp == null) {
    		call.say('No bot connected.');
    	}
    	curr_call = call;
       call.gather(getDigits, {numDigits: 1}).say("Beep boop beep");
     
    });

});
