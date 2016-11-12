var express = require('express');
var router = express.Router();
var path = require('path');
var handlebars = require('handlebars');
var fs = require('fs');
var http = require('http');
var redis = require('redis');
var app = express();


// respond with "hello world" when a GET request is made to the homepage

// Get Homepage
var login_path = 'localhost:3000/login'
router.get('/locations', ensureAuthenticated, function(req, res){
	//if(validate_token(req)){
		res.render('index');
	//}
	//else{
		//res.redirect(login_path);
	//}	
});

router.get('/locations/:location_id', ensureAuthenticated, show_venue);

router.get('/foursquare/:lat/:long', function(req, res) {
  var lat = req.params.lat;
  var long = req.params.long;

  console.log(lat);
  console.log(long);
	foursquare_venues(lat, long, function(venues){
      res.json(venues);
	});
});

function show_venue(req, res)
{
	if(true)
	{
		get_venue(req.params.location_id, function(venue_name, photos){
			res.render('create-chat', {
				username: req.cookie.user.username,
				venue_name: venue_name,
				photos: photos,
				id: req.params.location_id
			});
		});
	}
	else{

	}
}

function get_venue(venue_id, callback)
{
	https = require("https");
	var body = [];
    var options = {
            host: 'api.foursquare.com',
            path: `/v2/venues/${venue_id}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&v=20161101&m=foursquare`
    };

    https.request(options, function(res){
		res.on('data', function(chunk){
			body.push(chunk);
		});
		res.on('end', function(){
			body = Buffer.concat(body).toString();
			response = JSON.parse(body);
			venue = response['response']['venue'];
			callback(venue['name'], venue['photos']);
		});
	}).end();
}

function foursquare_venues(lat, long, callback)
{
        console.log('entro al foursquare');
        https = require("https");
        var lat = lat;
        var long = long;

        var body = [];
        var venues;

        var options = {
                host: 'api.foursquare.com',
                path: `/v2/venues/search?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&v=20161101&m=foursquare&ll=${lat},${long}`
        };

        https.request(options, function(res){
		res.on('data', function(chunk){
			body.push(chunk);
		});
		res.on('end', function(){
			body = Buffer.concat(body).toString();
			venues = JSON.parse(body)['response']['venues'];
			callback(venues);
		});
	}).end();
  console.log("termina de buscar cosas en foursquare");
}

function validate_token(req){}

function ensureAuthenticated(req, res, next){
  return next();
	//if(req.isAuthenticated()){
		//return next();
	//} else {
		//req.flash('error_msg','You are not logged in');
		//res.redirect('/users/login');
	//}
}

module.exports = router;
