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

router.get('/chat_created/:id', function(req, res) {
    console.log("revisa que esta creado");
    var id = req.params.id
    res.setHeader('CHAT-ID', id);
    res.setHeader('CHAT-API-SECRET-KEY', process.env.CHAT_API_SECRET_KEY)
    res.redirect('/api/v1/is_chat_created');
});
router.get('/create_chat/:id/:venue', ensureAuthenticated, function(req, res) {
  var id = req.params.id
  var venue = req.params.venue

  register_chat(req.user._id, id, venue, function(err){
    if(err)
    {
      console.log(err);
    }
    create_chat(id, venue, function()
    {
      join_chat(id, req.user._id, req.user.username, function(){
        res.redirect('../../../chat_room/' + id);     
        res.end();
      });
    });
  });  
});

router.get('/join_chat/:id/:venue', ensureAuthenticated, function(req, res) {
  var id = req.params.id
  var venue = req.params.venue

  register_chat(req.user._id, id, venue, function(err){
    if(err)
    {
      console.log(err);
    }
    join_chat(id, req.user._id, req.user.username, function(){
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
                host: req.hostname
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

function join_chat(chat_id, user_id, username, callback)
{
  var body = [];
  var options = {
      host: 'localhost',
      path: '/api/v1/join_chat',
      port: 3000,
      headers: {
        'USER-ID': user_id,
        'CHAT-ID': chat_id,
        'USERNAME': username,
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
function create_chat(chat_id, chat_name, callback)
{
  var body = [];
  var options = {
      host: 'localhost',
      path: '/api/v1/create_chat',
      port: 3000,
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

function register_chat(user_id, chat_id, chat_name, callback)
{
  var body = [];
  var options = {
      host: 'localhost',
      path: '/users-chats/register',
      port: 3002,
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

function chat_list(user_id, callback)
{
  var body = [];
  var options = {
      host: 'localhost',
      path: '/users-chats/list',
      port: 3002,
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
