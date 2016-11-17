var express = require('express');
var router = express.Router();
var path = require('path');
var handlebars = require('handlebars');
var fs = require('fs');
var http = require('http');
var redis = require('redis');
var app = express();
var jwt = require('jsonwebtoken');
var request = require('request');

var login = '/users/login';

router.get('/', function(req, res) {
    res.redirect('/locations');
})

router.get('/locations', ensureAuthenticated, function(req, res) {
    //if(validate_token(req)){
    res.render('index', {
        host: req.hostname,
        username: req.user.username,
    }); //}
    //else{
    //res.redirect(login_path);
    //}
});

router.get('/my_chats', ensureAuthenticated, function(req, res) {
    res.render('my_chats',{
      username: req.user.username,
    });
});

router.get('/locations/:location_id', ensureAuthenticated, show_venue);

router.get('/my_chats_list', ensureAuthenticated, function(req, res) {
    chat_list(req.hostname, req.user._id, function(list)
    {
      res.send(list);
    });
});

router.get('/foursquare/:lat/:long', function(req, res) {
    var lat = req.params.lat;
    var long = req.params.long;

    console.log(lat);
    console.log(long);
    foursquare_venues(lat, long, function(venues) {
        res.json(venues);
    });
});

function show_venue(req, res) {
    get_venue(req.params.location_id, function(venue_name, photos) {
        if (photos != undefined) { // Hay foto
            res.render('create-chat', {
                username: req.user.username,
                prefix: photos['prefix'],
                suffix: photos['suffix'],
                width: photos['width'],
                height: photos['height'],
                venue_name: venue_name,
                photos: photos,
                id: req.params.location_id,
                host: req.hostname
            });
        } else {
            res.render('create-chat', {
                username: req.user.username,
                venue_name: venue_name,
                photos: photos,
                id: req.params.location_id,
                host: req.hostname
            });
        }

    });

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
            if (venue != undefined) {
                callback(venue['name'], venue['bestPhoto']);
            }
        });
    }).end();
}

function foursquare_venues(lat, long, callback) {
    https = require("https");
    var lat = lat;
    var long = long;
    var body = [];
    var venues;
    var options = {
        host: 'api.foursquare.com',
        path: `/v2/venues/search?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&v=20161101&m=foursquare&ll=${lat},${long}`
    };

    https.request(options, function(res) {
        res.on('data', function(chunk) {
            body.push(chunk);
        });
        res.on('end', function() {
            body = Buffer.concat(body).toString();
            venues = JSON.parse(body)['response']['venues'];

            callback(venues);
        });
    }).end();
}

function validate_token(req) {}

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
      callback(JSON.stringify(res.body));
    }
  });
}

module.exports = router;
