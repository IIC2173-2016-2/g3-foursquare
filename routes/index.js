var express = require('express');
var router = express.Router();
var path = require('path');
var handlebars = require('handlebars');
var fs = require('fs');
var http = require('http');
var redis = require('redis');
var app = express();
var jwt = require('jsonwebtoken');

var login = '/users/login';

router.get('/', function(req, res){
	res.redirect('/locations');
})

router.get('/locations', ensureAuthenticated, function(req, res){
	//if(validate_token(req)){
	res.render('index',
		{
			host: req.hostname
		});	//}
	//else{
		//res.redirect(login_path);
	//}
});

router.get('/my_chats', ensureAuthenticated, function(req, res){
		res.render('my_chats');
});

router.get('/locations/:location_id', ensureAuthenticated, show_venue);

router.get('/my_chats_list/:lat/:long', function(req, res) {
  var lat = req.params.lat;
  var long = req.params.long;

  console.log(lat);
  console.log(long);
	foursquare_venues(lat, long, function(venues){
      res.json(venues);
	});
});

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
				username: req.user.username,
				venue_name: venue_name,
				photos: photos,
				id: req.params.location_id,
				key: process.env.CHAT_API_SECRET_KEY,
				host: req.hostname
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
            path: `/v2/venues/${venue_id}?client_id=TLTQFJWE5METPKFLMEPIOQPDBUVSR2NLBSTRUIWGZRKYZECQ&client_secret=5Y3RZRKHJQQXF23GEREEWFOGSK40GKD2QK0QS0XFJQMPGFCT&v=20161101&m=foursquare`
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
                path: `/v2/venues/search?client_id=TLTQFJWE5METPKFLMEPIOQPDBUVSR2NLBSTRUIWGZRKYZECQ&client_secret=5Y3RZRKHJQQXF23GEREEWFOGSK40GKD2QK0QS0XFJQMPGFCT&v=20161101&m=foursquare&ll=${lat},${long}`
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

	jwt.verify(req.cookies['access-token'], process.env.JWT_SECRET, function(err, decoded) {
	  if(decoded)
	  {
	  	req.user = decoded._doc;
	  	return next();
	  }
	  else
	  {
	  	res.redirect(302, login);
	  }
	  if(err)
	  {
	  	console.log(err);
	  }
	});
}

module.exports = router;
