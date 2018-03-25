'use strict'
const debug = require('debug')('batter-up:index')

let express = require('express')
let router = express.Router()

let worldStateManager = require('../data/worldStateManager')
let mlbClient = require('../data/mlbClient')

// gets the world state
router.get('/', function (req, res, next) {
  let val = worldStateManager.getState()

  return res.status(200).send(val)
})

router.post('/playerInfo', function (req, res, next) {
  // some weird stuff from jquery post calls
  let ids = req.body['ids[]']

  if (!ids || ids.length === 0) {
    return res.status(400).send('No ids passed in')
  }

  mlbClient.getPlayerInfo(ids)
    .then(data => {
      return res.status(200).send(data)
    })
    .catch(err => {
      debug(err)
      return res.status(500).send('an error has occured')
    })
})

// get all players
router.get('/allPlayers', function (req, res, next) {
  mlbClient.getAllPlayers()
    .then(players => {
      return res.status(200).send({data: players})
    })
    .catch(err => {
      debug(err)
      return res.status(500).send('an error has occured')
    })
})

// health check
router.get('/health', function (req, res, next) {
  return res.status(200).send(`I'm alive!`)
})

module.exports = router
