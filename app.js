var express = require('express');
var path = require('path');
var logger = require('morgan');
var childProcesss = require('child_process');

var indexRouter = require('./routes/index');
var dataRouter = require('./routes/data');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const cache = {
    totalTracks: 0
}

var queries = require('./queries');
const { strict } = require('assert');
queries.getTotalCount(cache);

app.locals.cache = cache;

app.use('/', indexRouter);
app.use('/data', dataRouter);


//const monitoringService = childProcesss.fork('./monitoringService.js');
//monitoringService.on('message', (message) => {
//    console.log(message);
//});


//monitoringService.on('error', function (data) {
//    console.log("IM HERE - Error");
//    console.log('test: ' + data);
//});

//require('./monitoringService');

module.exports = app;
