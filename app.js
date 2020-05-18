const express = require('express');
const app = express();
const router = express.Router();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const url = require('url');
const path = require('path');
const favicon = require('serve-favicon');
const root = __dirname;
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

// *** load data from local file  ***
const fs = require('fs');
let myData = null;
let planetData = null;

fs.readFile(__dirname + "/JSON/planets.json", function (err, data) {
  planetData = [];
  if (err) {
    return;
    console.error(err);
  } else {
    planetData = JSON.parse(data);
    console.log(planetData.length + ' planets');
  }
});

fs.readFile(__dirname + "/JSON/highscores.json", function (err, data) {
  myData = []; // if file does not exist
  	//                  -> first run
  	//                     create an empty array
  if (err) {
  	return;
    console.error(err);
  } else {
  	myData = JSON.parse(data);
    console.log(myData.length + ' existing players');
  }
});

// ======================================

let route = {
	routes : {},
	for: function(method,path,handler){  // HTTP methods
		this.routes[method+path] = handler;
	}
}

app.post("/update", function(request,response) {
  let saved = '';
  request.on('data', function(data){
      saved += data;
  });
  request.on('end', function(){
  let receivedObject = JSON.parse(saved);
  console.log('received: '+ JSON.stringify( saved ) );

  var i;
  for (i=0; i< planetData.length; i++){
      console.log(i);
      if (receivedObject.planetName==planetData[i].planetName){
          console.log("planet found");
          if (planetData[i].planetMinerals >= receivedObject.foundMinerals) {
              planetData[i].planetMinerals-=receivedObject.foundMinerals;
              console.log(planetData[i].planetMinerals + ` minerals left on ` + planetData[i].planetName);
              let sufficient = true;
              console.log(sufficient + ", test");
              console.log("Sufficient minerals <3");
          } else {
              let sufficient = false;
              console.log(sufficient + ", test");
              console.log("Insufficient minerals ;(");
              console.log(`Too few minerals left on` + planetData[i].planetName + `: ` + planetData[i].planetMinerals);
          }
          i=planetData.length;
      } else{
          console.log("not on " + planetData[i].planetName);
      }
  };

  fs.writeFile(__dirname + "/JSON/planets.json", JSON.stringify(planetData) ,  function(err) {
    if (err) {
      return console.error(err);
    }
    console.log("Planet minerals updated successfully!");
  });

      response.setHeader("Content-Type", "text/json");
      response.end( JSON.stringify( planetData ) );
      console.log('sent: '+ JSON.stringify( planetData ) );	// debug
  });
});
app.post("/quit", function(request,response) {
  let store = '';
    request.on('data', function(data){
        store += data;
    });
    request.on('end', function(){
    let receivedObj = JSON.parse(store);
    console.log('received: '+ JSON.stringify( store ) );	// debug
        var i;
        var x= new Boolean("true");
        for (i=0; i< myData.length; i++){
            console.log(i);
            if (receivedObj.username==myData[i].username){
                x = false;
                console.log("here");
                if (receivedObj.bestScore>myData[i].bestScore){
                    console.log("high");
                    myData[i].bestScore=receivedObj.bestScore

                }
                else{
                    console.log("score too low");
                }
            }};
        if (x){
            console.log("not here");
            myData.push( {username: receivedObj.username ,
            bestScore: receivedObj.bestScore} );
        }

    // then save the score on the file...
    fs.writeFile(__dirname + "/JSON/highscores.json", JSON.stringify(myData) ,  function(err) {
      if (err) {
        return console.error(err);
      }
      console.log("Data written successfully!");
    });

        response.setHeader("Content-Type", "text/json");
        response.end( JSON.stringify( myData ) );
        console.log('sent: '+ JSON.stringify( myData ) );	// debug
    });
});

// ===========================================
// =                  CHAT                   =
// ===========================================

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// ======================================

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

http.listen(port, () => {
  console.log('listening on *:3000');
});
