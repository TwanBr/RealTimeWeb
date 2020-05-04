const http = require('http');
const url = require('url');
const path = require('path');
const root = __dirname;
var port = process.env.PORT || 3000

// *** load data from local file  ***
const fs = require('fs');
let myData = null;

/*fs.writeFile(__dirname + '/JSON/highsscores.json', JSON.stringify(myData), function(err) {
  if (err) {
    return console.error(err);
  }*/

  fs.readFile(__dirname + '/JSON/highscores.json', function (err, data) {
  	myData = []; // if file does not exist
  		//                  -> first run
  		//                     create an empty array
  	if (err) {
  		return; //console.error(err);
  	} else {
  		myData = JSON.parse(data);
      console.log(myData); //This one works - gets printed in terminal
  	}
  });

//})

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
	serverStatic(response,"resources/jquery-3.3.1.js");
	console.log("routes test1"); //Does not work?
});

route.for("GET","/", function(request,response){
	serverStatic(response,"index.html");
	console.log("routes test2"); //Does not work?
});
// serving static files - end


route.for("POST","/", function(request,response){
	console.log('testing post routes'); //Does not work?

	let store = '';
    request.on('data', function(data){
        store += data;
    });
    request.on('end', function(){
		let receivedObj = JSON.parse(store);
		console.log('received: '+ JSON.stringify( store ) );	// debug //Does not work?

		// add new todo item to the list...
		myData.push( {username: playerName ,
					  bestScore: state.food} );

		// then save the list on the file...
		fs.writeFile(__dirname + '/JSON/highscores.json', JSON.stringify(myData) ,  function(err) {
			if (err) {
				return console.error(err);
			}
			console.log("Data written successfully!"); //Does not work?
		});

        response.setHeader("Content-Type", "text/json");
        response.end( JSON.stringify( myData ) );
        console.log('sent: '+ JSON.stringify( myData ) );	// debug //Does not work?
    });

});

// ======================================

function onRequest(request,response){
	let pathname = url.parse(request.url).pathname;
	console.log("Request for "+request.method + pathname+" received."); //Does not work?

	// a switch statement
	if (typeof route.routes[request.method+pathname] === 'function'){
		route.routes[request.method+pathname](request,response);
	} else {
		response.writeHead(404,{"Content-Type":"text/plain"});
		response.end("404 not found"); // is like write+end
	}
}

/*http.createServer(function(req, res) {
    var url = './' + (req.url == '/' ? 'index.html' : req.url)
    fs.readFile(url, function(err, html) {
        if (err) {
            var message404 = "There is no such page! <a href='/'>Back to home page</a>"
            res.writeHead(404, {'Content-Type': 'text/html', 'Content-Length': message404.length})
            res.write(message404)
        } else {
            res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': html.length})
            res.write(html)
        }
        res.end()
    })
}).listen(port,() => {
    console.log(`Server running at port `+port); //Works
});*/


// ANVA -> you were not calling onRequest ever in your code ;)
http.createServer(onRequest)
	.listen(port,() => {
    	console.log(`Server running at port `+port); //Works
	});
