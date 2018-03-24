'use strict'

let express = require('express')
let router = express.Router()

let worldStateManager = require('../data/worldStateManager')

router.get('/', function (req, res, next) {
  let val = worldStateManager.getState()

  return res.status(200).send(val)
})

// health check
router.get('/health', function (req, res, next) {
  return res.status(200).send(`I'm alive!`)
})

module.exports = router
