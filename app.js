const http = require('http');
const url = require('url');
const path = require('path');
const root = __dirname;
var port = process.env.PORT || 3000

// *** load data from local file  ***
const fs = require('fs');
let myData = null;
let planetData = null;

  fs.readFile(__dirname + "/JSON/planets.json", function (err, data) {
    planetData = [];
    if (err) {
      return;
    } else {
      planetData = JSON.parse(data);
      console.log(planetData.length);
    }
  });

  fs.readFile(__dirname + "/JSON/highscores.json", function (err, data) {
  	myData = []; // if file does not exist
  		//                  -> first run
  		//                     create an empty array
  	if (err) {
  		return; //console.error(err);
  	} else {
  		myData = JSON.parse(data);
      console.log(myData.length); //This one works - gets printed in terminal
  	}
  });

const serverStatic = function(response,file){
	let fileToServe = path.join(root,file);
	let stream = fs.createReadStream(fileToServe);

	stream.on('data',function(chunk){
		response.write(chunk);
	});
	stream.on('end',function(){
		response.end();
	});
};

// ======================================

let route = {
	routes : {},
	for: function(method,path,handler){  // HTTP methods
		this.routes[method+path] = handler;
	}
}

// serving static files - begin
route.for("GET","/resources/jquery-3.3.1.js", function(request,response){
	serverStatic(response,"/resources/jquery-3.3.1.js");
});

route.for("GET","/", function(request,response){
	serverStatic(response,"index.html");
});
// serving static files - end

route.for("POST","/", function(request,response){
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

/*
    response.on('end', function() {
      let sufficient = sufficient;
      console.log("enough of: " + sufficient);
    });
    */

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

route.for("POST","/quit", function(request,response){
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
                x= false;
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

// ======================================

function onRequest(request,response){
	let pathname = url.parse(request.url).pathname;
	console.log("Request for "+request.method + pathname+" received.");

	// a switch statement
	if (typeof route.routes[request.method+pathname] === 'function'){
		route.routes[request.method+pathname](request,response);
	} else {
		response.writeHead(404,{"Content-Type":"text/plain"});
		response.end("404 not found"); // is like write+end
	}
}

// ANVA -> you were not calling onRequest ever in your code ;)
http.createServer(onRequest)
	.listen(port,() => {
    	console.log(`Server running at port `+port); //Works
	});
