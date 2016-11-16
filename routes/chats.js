var express = require('express');
var router = express.Router();
var path = require('path');
var handlebars = require('handlebars');
var fs = require('fs');
var http = require('http');
var jwt = require('jsonwebtoken');

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


router.get('/chat_created/:id',function(req,res){
  var id = req.params.id
  res.setHeader('chat_id',id);
  res.setHeader('CHAT_API_SECRET_KEY',process.env.CHAT_API_SECRET_KEY)
  res.redirect('/api/v1/is_chat_created');
});
router.get('/create_chat/:id/:venue',ensureAuthenticated, function(req, res) {
  // LOOK IN COOKIE THE TOKEN USERNAME
  var id = req.params.id
  var venue = req.params.venue
  res.setHeader('chat_id',id);
  res.setHeader('chat_name',venue);
  res.setHeader('CHAT_API_SECRET_KEY',process.env.CHAT_API_SECRET_KEY)
  res.redirect('/api/v1/create_chat');
});

router.get('/join_chat/:id/:venue',ensureAuthenticated, function(req, res) {
  var id = req.params.id
  var venue = req.params.venue
  res.setHeader('chat_id',id);
  res.setHeader('user_id',req.user._id);
  res.setHeader('username',req.user.username);
  res.setHeader('CHAT_API_SECRET_KEY',process.env.CHAT_API_SECRET_KEY);
  res.redirect('/api/v1/join_chat');
});

function show_venue(req, res)
{
	if(true)
	{
		get_venue(req.params.location_id, function(venue_name, photos){
			console.log("asdkaspodaosdaopskdaskdoaskdok");
			console.log(photos);
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

module.exports = router;
