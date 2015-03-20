var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var url = require('url');
var app = express();
app.use(bodyParser());
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
	return((user ==='cs360')&&(pass === 'test'));
});
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);
  app.use('/', express.static('./html', {maxAge: 60*60*1000}));
  app.get('/getcity', function (req, res) {
    var urlObj = url.parse(req.url, true, false);
    console.log("In getcity route");
    var myRegEx = new RegExp("^"+urlObj.query["q"]);
    fs.readFile('cities.dat.txt', function (err, data) {
            if(err) throw err;
            cities = data.toString().split("\n");
            var jsonresult = [];
            for(var i = 0; i < cities.length; i++) {
                    var result = cities[i].search(myRegEx);
                    if(result != -1) {
                            jsonresult.push({city:cities[i]});
                            console.log(cities[i]);
                    }
            }
            console.log(JSON.stringify(jsonresult));
            res.writeHead(200);
            res.end(JSON.stringify(jsonresult));
    });
  });
  app.get('/comments', function(req, res) {
    console.log("In comment route");
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://localhost/weather", function(err, db)
    {
            if(err) throw err;
            db.collection("comments", function(err, comments)
            {
                   if(err) throw err;
                   comments.find(function(err, items)
                   {
                           items.toArray(function(err, itemArr)
                           {
                                   console.log("Document Array: ");
                                   console.log(itemArr);
                                   res.writeHead(200);
			   	   res.end(JSON.stringify(itemArr));
                           });
                   });
            });
    });
});
app.post('/comments', auth, function(req, res) {
    console.log("In POST comment route");
    console.log(req.user);
    console.log("Remote User: "+ req.remoteUser);
    // First read the form data
    var jsonData = "";
    console.log(req.body);
        // Now put it into the database
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect("mongodb://localhost/weather", function(err, db)
        {
        	console.log("Connected to mongo");
		if(err) throw err;
		console.log("Here1");
                db.collection('comments').insert(req.body,function(err, records)
                {
                	console.log("Record added as "+records[0]._id);
                });
        });
        res.writeHead(200);
        res.end("");
}); 
