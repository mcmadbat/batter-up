'use strict'

let express = require('express')
let logger = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')

let app = express()

let index = require('./routes/index')

const updateInterval = 1000

// start world state manager
// updates the game infos
let worldStateManager = require('./data/worldStateManager')
worldStateManager.init(updateInterval)

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// routes
app.use('/', index)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  console.error(err)

  res.status(err.status || 500)

  if (req.app.get('env') === 'development') {
    res.send(err)
  } else {
    res.send('an error has occured!')
  }
})

module.exports = app
