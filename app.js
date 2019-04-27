var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connect = require('connect');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var helmet = require('helmet');

var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/Mith', {
  useNewUrlParser: true
});

var index = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser('secret'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  store: new MongoStore({
    url: 'mongodb://localhost:27017/Mith'
  }),
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 86400000
  }
}));

app.use('/', index);

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;