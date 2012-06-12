var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , net = require('net')

arduinoTcp = null;

app.listen(8090);

function handler (req, res) {
  fs.readFile(__dirname + '/arduino.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading arduino.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.on('gobuttonclick', function (data) {

        arduinoTcp.write(data.direction);
    
  });
});

//tcp socekt server
var tcpServer = net.createServer(function (socket) {
  console.log('tcp server running on port 1337');
});

tcpServer.on('connection',function(socket){
   socket.write('connected to the tcp server\r\n');
    console.log('num of connections on port 1337: ' + tcpServer.connections);
    
    arduinoTcp = socket;
    
    socket.on('data',function(data){
        console.log('received on tcp socket:'+data);
        socket.write('msg received\r\n');
            io.sockets.broadcast.emit('tcpreply'{data:data});
        }
    );
});
tcpServer.listen(1337);

