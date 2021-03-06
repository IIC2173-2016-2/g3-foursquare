var express = require('express');
var router = express.Router();
var path = require('path');
var handlebars = require('handlebars');
var fs = require('fs');
var request = require('request');
var jwt = require('jsonwebtoken');

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
        res.write(`{\"body\": ${response.body}}`);
        res.end();
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
    create_chat(req.hostname, id, venue, function(response)
    {
      console.log(response.body);
      join_chat(req.hostname, id, req.user._id, req.user.username, function(response){
        console.log(response.body);
        res.redirect('../../../chat/chat_room/' + id);
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
    join_chat(req.hostname, id, req.user._id, req.user.username, function(response){
      console.log(response.body);
      res.send({redirect_to: 'https://' + req.hostname + '/chat/chat_room/' + id});
      //res.redirect('../../../chat/chat_room/' + id);
      //res.end();
    });
  });
});

function show_venue(req, res) {
    if (true) {
        get_venue(req.params.location_id, function(venue_name, photos) {
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
      url: 'https://' + host + '/api/v1/is_chat_created',
      headers: {
        'CHAT-ID': chat_id,
        'CHAT-API-SECRET-KEY': process.env.CHAT_API_SECRET_KEY
      }
  };

  request(options, function(err, res) {
    if(err)
    {
      console.log(err);
    }
    else
    {
      callback(res);
    }
  });
}

function join_chat(host, chat_id, user_id, username, callback)
{
  var body = [];
  var options = {
      url: 'https://' + host + '/api/v1/join_chat',
      headers: {
        'USER-ID': user_id,
        'CHAT-ID': chat_id,
        'USERNAME': username,
        'CHAT-API-SECRET-KEY': process.env.CHAT_API_SECRET_KEY
      }
  };

  request(options, function(err, res) {
    if(err)
    {
      console.log(err);
    }
    else
    {
      callback(res);
    }
  });
}
function create_chat(host, chat_id, chat_name, callback)
{
  var body = [];
  var options = {
      url: 'https://' + host + '/api/v1/create_chat',
      headers: {
        'CHAT-NAME': chat_name,
        'CHAT-ID': chat_id,
        'CHAT-API-SECRET-KEY': process.env.CHAT_API_SECRET_KEY
      }
  };

  request(options, function(err, res) {
    if(err)
    {
      console.log(err);
    }
    else
    {
      callback(res);
    }
  });
}

function register_chat(host, user_id, chat_id, chat_name, callback)
{
  var body = [];
  var options = {
      url: 'https://' + host + '/users-chats/register',
      headers: {
        'USER-ID': user_id,
        'CHAT-ID': chat_id,
        'NAME': chat_name,
        'USERS-CHAT-API-KEY': process.env.USERS_CHAT_API_KEY
      }
  };
  request(options, function(err, res) {
    callback(err);
  });
}

function chat_list(host, user_id, callback)
{
  var body = [];
  var options = {
      url: 'https://' + host + '/users-chats/list',
      headers: {
        'USER-ID': user_id,
        'USERS-CHAT-API-KEY': process.env.USERS_CHAT_API_KEY
      }
  };

  request(options, function(err, res) {
    if(err)
    {
      console.log(err);
    }
    else
    {
      callback(res);
    }
  });
}

module.exports = router;
