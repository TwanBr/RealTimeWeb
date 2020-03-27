var http = require('http');
var static = require('node-static');
var file = new static.Server();
var fs = require('fs');

fs.readFile('./index.html',function(err,html) {
  if (err) throw err;
  http.createServer(function(request, response) {
    request.addListener('end', function() {
      file.serve(request, response);
    }).resume();
    
    response.writeHeader(200, {"Content-Type": "text/html"});  
    response.write(html);  
    response.end(); 
  }).listen(process.env.PORT || 3000);
});
