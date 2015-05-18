var mqtt = require('mqtt');
var http = require('http');
var fs = require('fs');
var WebSocketServer = require('websocket').server;
var webSocketServer = require('websocket').server;

// used to store the client connections
var numClients = 0;
var clientArray = {};
var latestData = {};

// setup the websocket/server enpoint
var mainPage = fs.readFileSync('page.html');
var server = http.createServer(function(request,response) {
   response.writeHead(200, {'Content-Type': 'text/html'});
   response.end(mainPage);
});

server.listen(3000,function(){
});;

wsServ = new WebSocketServer({
   httpServer:server
});

wsServ.on('request', function(newRequest) {
   // accept connection and add to the list of clients
   var newConnection = newRequest.accept('text',newRequest.origin);
   var id = numClients++;
   clientArray[id] = newConnection;

   for (var key in latestData) {
      newConnection.sendUTF(key + ":" + latestData[key]);
   } 

   // when client disconnections remove it from the list
   newConnection.on('close', function(reason,description) {
      delete clientArray[id];
   });
});

var client = mqtt.createClient(1883,<MQTT BROKER IP>);

client.on('connect',function() {
   client.subscribe('house/+/+/+');
   client.subscribe('house/+/+');
   client.subscribe('house/+');
});

client.on('message', function(topic, message) {
   var timestamp = message.split(",")[0];
   var parts = message.split(":");
   if (1 < parts.length) {
      var value = parts[1].trim();
      latestData[topic] = value;
      for (var i in clientArray) {
         clientArray[i].sendUTF(topic + ":" + value);
      } 
   }
});

