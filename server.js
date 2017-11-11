var express = require("express");

// bodyParser is used for parsing POST requests
var bodyParser = require('body-parser')
console.log("TEST0")

// create express app
var app = express();

// add bodyParser to express app
app.use(bodyParser.urlencoded({
  extended: true
}))

var router = express.Router();
var path = __dirname + '/views/';

// use mongodb, connect to 'myproject'
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

console.log("TESTA")

// connection URL
// usually dont make this public
var url = 'mongodb://heroku_tsvzp3jp:be6kuh9l6qrkp602jntspm3lcc@ds157475.mlab.com:57475/heroku_tsvzp3jp';
// connect to the server
MongoClient.connect(url, function(err, db) {
  if (err) {
    throw err;
  }
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db.close();
});

console.log("TESTB")

// get traffic sign types
var trafficSignTypesList = require('./traffic_sign_types.json');
var trafficSignTypes = new Set(trafficSignTypesList)

// adds input 'trafficSign' to mongodb collection 'trafficsigns'
var insertTrafficSign = function(db, trafficSign, callback) {
  // get the trafficsigns collection
  var collection = db.collection('trafficsigns');

  // insert a traffic sign
  collection.insert(
    trafficSign,
    function(err, result) {
      assert.equal(err, null);
      console.log("Inserted a traffic sign into the collection.");
      callback(result);
    }
  );
}



// finds all traffic signs
var findTrafficSigns = function(db, constraints, callback) {
  // get the trafficsigns collection
  var collection = db.collection('trafficsigns');

  var long = constraints["longitude"];
  var lat = constraints["latitude"];
  var minlong = long - constraints["radius"];
  var maxlong = long + constraints["radius"];
  var minlat = lat - constraints["radius"];
  var maxlat = lat + constraints["radius"];
  var radius = constraints["radius"];

  // get all trafficsigns
  collection.find({
    "longitude": {$gte: minlong, $lte: maxlong},
    "latitude": {$gte: minlat, $lte: maxlat}
  }).toArray(function(err, signs) {
    assert.equal(err, null);
    // remove signs that aren't within radius of given point
    for (var i = signs.length - 1; i >= 0; i--) {
      distsq = Math.pow(signs["longitude"] - long, 2) +
               Math.pow(signs["latitude"] - lat, 2);
      if (distsq > Math.pow(radius, 2)) {
        signs.splice(i, 1);
      }
    }

    // remove extra signs
    var seenEnums = new Set([]);
    for (var i = signs.length - 1; i >= 0; i--) {
      if (!seenEnums.has(signs[i]["signtype"])) {
        console.log("new");
        seenEnums.add(signs[i]["signtype"]);
      } else {
        console.log("old")
        signs.splice(i, 1);
      }
    }

    console.log("Found the following traffic signs:");
    console.log(signs);
    callback(signs);
  });
}


console.log("TESTC")

// print out type of HTTP request
router.use(function (req, res, next) {
  console.log("/" + req.method);
  next();
});



router.get("/", function(req, res){
  res.render('index.ejs', { 'errors' : [false, false, false] });
});



router.post("/", function(req, res, next){
  // setup the error handling
  var typeErrors = [false, false, false]
  var hasError = false;

  // verify these are floats
  req.body["longitude"] = parseFloat(req.body["longitude"])
  if (isNaN(req.body["longitude"])) {
    typeErrors[0] = true;
    hasError = true;
  }

  req.body["latitude"] = parseFloat(req.body["latitude"])
  if (isNaN(req.body["latitude"])) {
    typeErrors[1] = true;
    hasError = true;
  }

  if (!trafficSignTypes.has(req.body["signtype"])) {
    typeErrors[2] = true;
    hasError = true;
  }

  if (hasError) {
    // render error page
    res.render('index.ejs', { 'errors' : typeErrors });
  } else {
    res.render('index.ejs', { 'errors' : [false, false, false] });
    // insert a traffic sign
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("connected successfully to server");

      insertTrafficSign(db, req.body, function() {
        console.log("inserted: " + JSON.stringify(req.body))
        db.close();
      });
    });
  }
});



router.get("/view", function(req, res){
  res.render('view.ejs', {
    'errors' : [false, false, false],
    'trafficsigns' : [] 
  });
});



router.post("/view", function(req, res){
    // setup the error handling
  var typeErrors = [false, false, false]
  var hasError = false;

  // verify these are floats
  req.body["longitude"] = parseFloat(req.body["longitude"])
  if (isNaN(req.body["longitude"])) {
    typeErrors[0] = true;
    hasError = true;
  }

  req.body["latitude"] = parseFloat(req.body["latitude"])
  if (isNaN(req.body["latitude"])) {
    typeErrors[1] = true;
    hasError = true;
  }

  req.body["radius"] = parseFloat(req.body["radius"])
  if (isNaN(req.body["radius"])) {
    typeErrors[2] = true;
    hasError = true;
  }

  if (hasError) {
    // render error page
    res.render('view.ejs', { 
      'errors' : typeErrors,
      'trafficsigns' : []
    });
  } else {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("connected successfully to server");

      findTrafficSigns(db, req.body, function(signs) {
        if ("type" in req.body && req.body["type"] == "json") {
          res.send(JSON.stringify(signs, null, '\t'));
        } else {
          res.render('view.ejs', {
            'errors' : [false, false, false],
            'trafficsigns' : signs 
          });
        }
        db.close();
      });
    });
  }
});

app.use("/", router);
app.use(express.static(__dirname + '/public'));

app.use("*", function(req, res){
  res.sendFile(path + "404.html");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Live at Port 3000");
});
