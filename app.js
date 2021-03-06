var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var session = require('express-session');
var routes = require('./routes/index');
var chats = require('./routes/chats');
var bodyParser = require('body-parser');

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));
app.use('/locations',chats)
app.use('/', routes);

// Set Port
app.set('port', (process.env.PORT || 9001));

app.listen(app.get('port'), function(){
  console.log('Server started on port '+app.get('port'));
});
