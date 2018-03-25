'use strict'
const debug = require('debug')('batter-up:index')

let express = require('express')
let router = express.Router()

let moment = require('moment')

let worldStateManager = require('../data/worldStateManager')
let mlbClient = require('../data/mlbClient')

// dirty cache ewww
let allPlayers = {
  updated: moment()
}

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
      return res.status(500).send('An error has occured')
    })
})

// get all players
router.get('/allPlayers', function (req, res, next) {
  // if stale data
  if (!allPlayers.data || moment().diff(allPlayers.updated, 'h') >= 12) {
    debug('no all player data or all player data is stale')
    mlbClient.getAllPlayers()
      .then(players => {
        allPlayers = {
          data: players,
          updated: moment()
        }

        return res.status(200).send(allPlayers)
      })
  } else {
    return res.status(200).send(allPlayers)
  }
})

// health check
router.get('/health', function (req, res, next) {
  return res.status(200).send(`I'm alive!`)
})

module.exports = router
