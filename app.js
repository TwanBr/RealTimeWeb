const express = require('express');
const app = express();
const router = express.Router();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const url = require('url'); //Not used?
const path = require('path');
const favicon = require('serve-favicon');
const root = __dirname;

//Load public files
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

const { MongoClient } = require('mongodb');
// Connection URL
const uri = 'mongodb+srv://spaceDBuser:Pjufp3M8SBiGYZXP@cluster1-wjvck.azure.mongodb.net/spaceDB?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = "spaceDB";

// *** load data from local file  ***
const fs = require('fs');
let myData = null;
let planetData = null;
let stateData = null;

//load data from mongoATLAS
async function load() {
    try {
        await client.connect();
        console.log ("Connected to mongoDB server");
        const db = client.db(dbName);
        // get the documets from state, planets, highsocre data
        const col1 = db.collection("state"); 
        const col2 = db.collection("planets"); 
        const col3 = db.collection("highscores");
        
        //Turn the documents into arrays
        stateData = await col1.find({}).toArray();
        planetData = await col2.find({}).toArray();
        myData = await col3.find({}).toArray();
    } catch (err) {
        print(err.stack);
    } finally {
        //console.log(stateData.length + ' player states found'); // debug
        //console.log(planetData.length + ' planets found'); // debug
        //console.log(myData.length + ' highscores in database'); // debug
    }
}

load().catch(console.dir);

// ===========================================
// =                  ROUTES                 =
// ===========================================

let route = {
	routes : {},
	for: function(method,path,handler){  // HTTP methods
		this.routes[method+path] = handler;
	}
}

app.post("/start", function (req, res){
    let start = '';
    req.on('data', function (data){
        start += data;
        req.on('end', function(){
            let receivedPlayer = JSON.parse(start);
            console.log ('Received: ' + JSON.stringify(start)); // debug
        });
        res.setHeader("Content-Type", "text/json");
        res.end (JSON.stringify (stateData));
        console.log ('Sent from server: ' + JSON.stringify(stateData)); // debug
    })
}); //mongoDB done

app.post("/update", function(request,response) {
  let saved = '';
  request.on('data', function(data){
      saved += data;
  });
  request.on('end', function(){
  let receivedObject = JSON.parse(saved);
  //console.log('Received: ' + JSON.stringify(saved)); // debug

  async function updatePlanet() {
      try {
          const db = client.db(dbName);
          const col2 = db.collection("planets");

          await col2.findOneAndUpdate(
            { planetName : receivedObject.planetName }, //find the data linked to the correct planetName
            { $inc : { planetMinerals : -receivedObject.foundMinerals } }, //increment planetMinerals
            { new : true },// ????
          );
      } catch (err) {
          console.log(err.stack);
      } finally {
      }
  }
  for (var i = 0; i < planetData.length; i++){
      //Find correct planet
      if (receivedObject.planetName==planetData[i].planetName){
          //If planet is found
          if (planetData[i].planetMinerals >= receivedObject.foundMinerals) {
              planetData[i].planetMinerals -= receivedObject.foundMinerals;
              console.log("Sufficient minerals <3");
              console.log(planetData[i].planetMinerals + ` minerals left on ` + planetData[i].planetName);
              updatePlanet().catch(console.dir);
          } else {
              console.log("Insufficient minerals ;(");
              console.log(`Too few minerals left on` + planetData[i].planetName + `: ` + planetData[i].planetMinerals);
          }
          i=planetData.length;
      } else {} //Continue loop if wrong planet
  };
  response.setHeader("Content-Type", "text/json");
  response.end( JSON.stringify( planetData ) );
  //console.log('sent UPDATE: '+ JSON.stringify( planetData ) );	// debug
  });
}); //mongoDB done for SEARCH, MOVE and RETURN HOME have to be checked// REMOVE THIS ONE ?

app.post("/quit", function(request,response) {
  let store = '';
    request.on('data', function(data){
        store += data;
    });
    request.on('end', function(){
    let receivedObj = JSON.parse(store);
    //console.log('received: '+ JSON.stringify( store ) );	// debug
        var i;
        var x= new Boolean("true");
        for (i=0; i< myData.length; i++){
            if (receivedObj.username==myData[i].username){
                x = false;
                if (receivedObj.bestScore>myData[i].bestScore){
                    myData[i].bestScore=receivedObj.bestScore
                    console.log("Previous highscore was surpassed");
                }
                else{
                    console.log("Previous highscore was not surpassed");
                }
            }};
        if (x){
            myData.push( {username: receivedObj.username ,
            bestScore: receivedObj.bestScore} );
        }

    async function updateHighScore() {
        try {
            const db = client.db(dbName);
            const col3 = db.collection("highscores");
            
            await col3.updateOne(
              { username : receivedObj.username }, //finds the right username
              { $set : {username : receivedObj.username, bestScore : receivedObj.bestScore }}, //updates
              { new : true, upsert : true } //upsert is a new document based on the filter criteria and update modifications
            );
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close(); // after the client is disconnected
        }
    }
    updateHighScore().catch(console.dir);
    response.setHeader("Content-Type", "text/json");
    response.end( JSON.stringify( myData ) );
    //console.log('sent QUIT: '+ JSON.stringify( myData ) );	// debug
    });}); 
//mongoDB done, this one also breaks connection??????????????

app.post ("/save", function (req, res){
    let save = '';
    req.on ('data', function (data){
        save += data;
    });
    req.on('end', function(){
        let receivedStat= JSON.parse (save);
        //console.log('received: '+ JSON.stringify( save ) ); // debug
        var i;
        var x= new Boolean("true");
        for (i=0; i< stateData.length; i++){
            if (receivedStat.username==stateData[i].username){
                x = false;
                stateData[i].fuel=receivedStat.fuel;
                stateData[i].minerals=receivedStat.minerals;
                stateData[i].planet=receivedStat.planet;
                stateData[i].flag=receivedStat.flag;
            }
        };

        if (x){
            stateData.push( {username: receivedStat.username ,
            fuel: receivedStat.fuel, minerals: receivedStat.minerals, planet: receivedStat.planet, flag: receivedStat.flag} );
        }

        async function updateState() {
            try {
                const db = client.db(dbName);
                const col1 = db.collection("state"); 
                //updates the data related to the correct username by setting the username, fuel,minerals, plnets, flag situation
                await col1.updateOne(
                  { username : receivedStat.username }, 
                  { $set : {
                      username : receivedStat.username,
                      fuel : receivedStat.fuel,
                      minerals : receivedStat.minerals,
                      planet : receivedStat.planet,
                      flag : receivedStat.flag
                    }
                  },
                  { new : true, upsert : true } //if the usernmae doesn't exist, it creates a new one and updates the state when the player quits
                );
            } catch (err) {
                console.log(err.stack);
            } finally {
            }
        }
        updateState().catch(console.dir);
        res.setHeader("Content-Type", "text/json");
        res.end( JSON.stringify( stateData ) );
        //console.log('sent SAVE: '+ JSON.stringify( stateData ) ); // debug
    })}); //mongoDB done
app.post("/planet", function (req, res){
    let planet='';
    req.on ('data', function(data){
        planet+= data;
        req.on ('end', function(){
            let Rplanet=JSON.parse (planet);

        });
        res.setHeader("Content-Type", "text/json");
        res.end (JSON.stringify (planetData));
        //console.log ('sent: '+ JSON.stringify (planetData)); // debug
    })
}) //no need for further mongoDB
app.post ("/grab", function(req, res){
    let grab = '';
    req.on ('data', function(data){
        grab += data;
        req.on ('end', function(){
            let Rgrab=JSON.parse (grab);
            var i;
            for (i=0; i<planetData.length; i++){
                if (Rgrab.planetName==planetData[i].planetName){
                    planetData[i].flag='NO';
                    Rgrab.flag='NO';
                }
            };

            async function updatePlanet() {
                try {
                    const db = client.db(dbName);
                    const col2 = db.collection("planets");
                    //updates the flag situation on the planet 
                    await col2.findOneAndUpdate(
                      { planetName : Rgrab.planetName },//finds the correct planet in question
                      { $set : { flag : Rgrab.flag } },// updates the flag, when a player grabs it 
                      { new : true },
                    );
                } catch (err) {
                    console.log(err.stack);
                } finally {
                }
            }
            updatePlanet().catch(console.dir);
            res.setHeader("Content-Type", "text/json");
            res.end (JSON.stringify (planetData));
            //console.log ('sent: '+ JSON.stringify (planetData)); // debug
    })
});

}); //TBD
app.post("/place", function(req,res){
    let place='';
    req.on ('data', function(data){
        place+=data;

        req.on ('end', function (){
            let Rplace=JSON.parse (place);
            var i;
            for (i=0; i<planetData.length; i++){
                if (Rplace.planetName==planetData[i].planetName){
                    planetData[i].flag='YES';
                    Rplace.flag='YES';
                }
            };

            async function updatePlanet() {
                try {
                    const db = client.db(dbName);
                    const col2 = db.collection("planets");

                    await col2.findOneAndUpdate(
                      { planetName : Rplace.planetName },//finds the correct planet 
                      { $set : { flag : Rplace.flag } },//updates the flag when a player places it on the planet in question
                      { new : true },
                    );
                } catch (err) {
                    console.log(err.stack);
                } finally {
                }
            }
            updatePlanet().catch(console.dir);
            res.setHeader("Content-Type", "text/json");
            res.end (JSON.stringify (planetData));
            //console.log ('sent: '+ JSON.stringify (planetData)); // debug
          });
        });
}); //TBD
app.post("/cheat", function (request,response){
  let saved = '';
  request.on('data', function(data){
      saved += data;
  });
  request.on('end', function(){
      let receivedObject = JSON.parse(saved);

      var i;
      for (i=0; i< planetData.length; i++){
          //console.log(i);
          if (receivedObject.planetName==planetData[i].planetName){
              //console.log("planet found");
              planetData[i].planetMinerals+=receivedObject.foundMinerals;
              i=planetData.length;
              cheatData().catch(console.dir);
          } else{
              //console.log("not on " + planetData[i].planetName);
          }
      };

      async function cheatData() {
          try {
              const db = client.db(dbName);
              const col2 = db.collection("planets");

              await col2.findOneAndUpdate(
                { planetName : receivedObject.planetName },//finds the correct planet 
                { $inc : { planetMinerals : receivedObject.foundMinerals } },//updates the planetMinerals on the found planet
                { new : true }
              );
          } catch (err) {
              console.log(err.stack);
          } finally {
          }
      }
      response.setHeader("Content-Type", "text/json");
      response.end( JSON.stringify( planetData ) );
      //console.log('sent UPDATE: '+ JSON.stringify( planetData ) );	// debug
  });
}); //mongoDB done

// ===========================================
// =                  CHAT                   =
// ===========================================

io.on('connection', function(socket){
    console.log(`User connected to chat`);
    socket.join("Earth");

    //Send this event to everyone in the room.
    io.to("Earth").emit('connectToRoom', `Earth`);
    socket.emit('connectToRoom', `Earth`);

    socket.on('message', function(message){
      console.log("Received message... ");
      let messageObj = JSON.parse(message);
      if (messageObj.message=='exit_Earth'){
         console.log('Changing chatroom ... ');
         socket.leave("Earth");
         socket.join("Venus");
         socket.emit('connectToRoom', "Venus");
      } else if (messageObj.message=='exit_Venus'){
         console.log('Changing chatroom ... ');
         socket.leave("Venus");
         socket.join("Earth");
         socket.emit('connectToRoom', "Earth");
      } else {
         io.to(messageObj.planet).send(JSON.stringify(messageObj));
         console.log(`  ... and shared to the room -> ${messageObj.user}: ${messageObj.message}`);
      }
    });

   socket.on('disconnect', function() {
        console.log(`User disconnected from chat`);
    });

});

// ======================================

 http.listen(3000, ()=>{
	console.log('Server started: listening on localhost:3000');
});
