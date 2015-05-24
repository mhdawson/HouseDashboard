var mqtt = require('mqtt');
var http = require('http');
var fs = require('fs');
var WebSocketServer = require('websocket').server;

// used to store the client connections
var numClients = 0;
var clientArray = {};
var latestData = {};

// read in the configuration data
var certsDir = '';
var serverPort = 3000;
var mqttServerUrl = '';
var options = '';
var dashBoardEntriesHTML = '';
var topicsArray = [];
var title = '';
function readConfig(configFile) {
   data = fs.readFileSync(configFile);
   var lines = data.toString().split('\n');
   for (line in lines) {
      var configParts = lines[line].split('=');
      if (1 < configParts.length) {
         var configKey = configParts[0];
         var configValue = configParts[1];
         if ('serverPort' == configKey) {
            serverPort = configValue;
         } else if ('certsDir' == configKey) {
            options = {
               key: fs.readFileSync(configValue + '/client.key'),
               cert: fs.readFileSync(configValue + '/client.cert'),
               ca: fs.readFileSync(configValue + '/ca.cert'),
               checkServerIdentity: function() { return undefined }
            }
         } else if ('title' == configKey) {
           title = configValue;
         } else if ('mqttServerUrl' == configKey) {
           mqttServerUrl = configValue;
         } else if ('dashboardEntries' == configKey) {
            dashboardEntries = configValue;
            var entriesArray = configValue.split(",");
            for(nextEntry in entriesArray) {
              var parts = entriesArray[nextEntry].split(":");
              topicsArray.push(parts[1]);
              dashBoardEntriesHTML = dashBoardEntriesHTML + '<tr><td>' + parts[0] +
                                                        ':</td><td id="' + parts[1] +
                                                        '">pending</td></tr>';
            }
         }
      }
   }
}

readConfig(process.argv[2]);

// setup the websocket/server enpoint
var mainPage = fs.readFileSync('page.html').toString();
mainPage = mainPage.replace('<DASHBOARD TITLE>', title);
mainPage = mainPage.replace('<UNIQUE_WINDOW_ID>', title);
mainPage = mainPage.replace('<DASHBOARD_ENTRIES>', dashBoardEntriesHTML);
var server = http.createServer(function(request,response) {
   response.writeHead(200, {'Content-Type': 'text/html'});
   response.end(mainPage);
});

server.listen(serverPort,function(){
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

var client = mqtt.connect(mqttServerUrl, options);

client.on('connect',function() {
   for(nextTopic in topicsArray) {
      client.subscribe(topicsArray[nextTopic]);
   }
});

client.on('message', function(topic, message) {
   var timestamp = message.toString().split(",")[0];
   var parts = message.toString().split(":");
   if (1 < parts.length) {
      var value = parts[1].trim();
      latestData[topic] = value;
      for (var i in clientArray) {
         clientArray[i].sendUTF(topic + ":" + value);
      } 
   }
});

