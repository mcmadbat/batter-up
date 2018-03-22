'use strict'

let express = require('express')
let router = express.Router()

router.get('/', function (req, res, next) {
  return res.status(200).send('hello world!')
})

// health check
router.get('/health', function (req, res, next) {
  return res.status(200).send(`I'm alive!`)
})

module.exports = router
