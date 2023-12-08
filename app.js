var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
var rateLimit = require("express-rate-limit");
var session = require("express-session");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var transactionRouter = require('./routes/transaction');
var customerRouter = require('./routes/customer');
var { formatDate } = require('./helpers/FormatInfo');
var app = express();

const hbs = require('express-handlebars')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('.hbs', hbs.engine({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    buttonStatus: function(status){
      // 0:lock, 1: unlock
      if(status == 1) return `<i class="fa-solid fa-lock"></i> Lock`
      return `<i class="fa-solid fa-lock-open"></i> Unlock`
    },
    formatDate: function(dateString){
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
    
      return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`
    }
  }
}))
hbs.create({
  knownHelpersOnly: true
})
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.locals.formatDate = formatDate;

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/transaction', transactionRouter);
app.use('/customers', customerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
