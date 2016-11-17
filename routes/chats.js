var express = require('express');
var router = express.Router();
var path = require('path');
var handlebars = require('handlebars');
var fs = require('fs');
var http = require('http');
var jwt = require('jsonwebtoken');
var http = require('http');

function ensureAuthenticated(req, res, next) {

    jwt.verify(req.cookies['access-token'], process.env.JWT_SECRET, function(err, decoded) {
        if (decoded) {
            req.user = decoded._doc;
            return next();
        } else {
            res.redirect(302, login);
        }
        if (err) {
            console.log(err);
        }
    });
}

router.get('/chat_created/:id', function(req, res, next) {
    console.log("revisa que esta creado");
    var id = req.params.id
    is_chat_created(req.hostname, id, function(response){
      console.log(response.statusCode);
      if(response.statusCode==200)
      {
        res.end(JSON.stringify({status: 200}));
      }
      else if(response.statusCode==404)
      {
        res.status = 404;
        var err = new Error('not found');
        err.status = 404;
        next(err);
      }
    });
});
router.get('/create_chat/:id/:venue', ensureAuthenticated, function(req, res) {
  var id = req.params.id
  var venue = req.params.venue

  register_chat(req.hostname, req.user._id, id, venue, function(err){
    if(err)
    {
      console.log(err);
    }
    create_chat(req.hostname, id, venue, function()
    {
      join_chat(req.hostname, id, req.user._id, req.user.username, function(){
        res.redirect('../../../chat_room/' + id);     
        res.end();
      });
    });
  });  
});

router.get('/join_chat/:id/:venue', ensureAuthenticated, function(req, res) {
  var id = req.params.id
  var venue = req.params.venue

  register_chat(req.hostname, req.user._id, id, venue, function(err){
    if(err)
    {
      console.log(err);
    }
    join_chat(req.hostname, id, req.user._id, req.user.username, function(){
      res.redirect('../../../chat_room/' + id);
      res.end();
    });
  });  
});

function show_venue(req, res) {
    if (true) {
        get_venue(req.params.location_id, function(venue_name, photos) {
            console.log("asdkaspodaosdaopskdaskdoaskdok");
            console.log(photos);
            res.render('create-chat', {
                username: req.user.username,
                venue_name: venue_name,
                photos: photos,
                id: req.params.location_id,
                key: process.env.CHAT_API_SECRET_KEY,
                host: req.hostnamename
            });
        });
    } else {

    }
}

function get_venue(venue_id, callback) {
    https = require("https");
    var body = [];
    var options = {
        host: 'api.foursquare.com',
        path: `/v2/venues/${venue_id}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&v=20161101&m=foursquare`
    };

    https.request(options, function(res) {
        res.on('data', function(chunk) {
            body.push(chunk);
        });
        res.on('end', function() {
            body = Buffer.concat(body).toString();
            response = JSON.parse(body);
            venue = response['response']['venue'];
            callback(venue['name'], venue['photos']);
        });
    }).end();
}

function is_chat_created(host, chat_id, callback)
{
  var body = [];
  var options = {
      host: host,
      path: '/api/v1/is_chat_created',
      headers: {
        'CHAT-ID': chat_id,
        'CHAT-API-SECRET-KEY': process.env.CHAT_API_SECRET_KEY
      }
  };

  http.request(options, function(res) {
      res.on('data', function(chunk) {
          body.push(chunk);
      });
      res.on('end', function() {
          body = Buffer.concat(body).toString();
          callback(res);
      });
  }).end();
}

function join_chat(host, chat_id, user_id, username, callback)
{
  var body = [];
  var options = {
      host: host,
      path: '/api/v1/join_chat',
      headers: {
        'USER-ID': user_id,
        'CHAT-ID': chat_id,
        'USERNAME': username,
        'CHAT-API-SECRET-KEY': process.env.CHAT_API_SECRET_KEY
      }
  };

  var req = http.request(options, function(res) {
      res.on('data', function(chunk) {
          body.push(chunk);
      });
      res.on('end', function() {
          body = Buffer.concat(body).toString();
          callback(body);
      });
  })
  console.log(req);
  req.end();
}
function create_chat(host, chat_id, chat_name, callback)
{
  var body = [];
  var options = {
      host: host,
      path: '/api/v1/create_chat',
      headers: {
        'CHAT-NAME': chat_name,
        'CHAT-ID': chat_id,
        'CHAT-API-SECRET-KEY': process.env.CHAT_API_SECRET_KEY
      }
  };

  http.request(options, function(res) {
      res.on('data', function(chunk) {
          body.push(chunk);
      });
      res.on('end', function() {
          body = Buffer.concat(body).toString();
          callback(body);
      });
  }).end();
}

function register_chat(host, user_id, chat_id, chat_name, callback)
{
  var body = [];
  var options = {
      host: host,
      path: '/users-chats/register',
      headers: {
        'USER-ID': user_id,
        'CHAT-ID': chat_id,
        'NAME': chat_name,
        'USERS-CHAT-API-KEY': process.env.USERS_CHAT_API_KEY
      }
  };
  http.request(options, function(res) {
      res.on('data', function(chunk) {
          body.push(chunk);
      });
      res.on('end', function() {
          body = Buffer.concat(body).toString();
          callback(body);
      });
  }).end();
}

function chat_list(host, user_id, callback)
{
  var body = [];
  var options = {
      host: host,
      path: '/users-chats/list',
      headers: {
        'USER-ID': user_id,
        'USERS-CHAT-API-KEY': process.env.USERS_CHAT_API_KEY
      }
  };

  http.request(options, function(res) {
      res.on('data', function(chunk) {
          body.push(chunk);
      });
      res.on('end', function() {
          body = Buffer.concat(body).toString();
          response = JSON.parse(body);
          callback(response);
      });
  }).end();
}

module.exports = router;
