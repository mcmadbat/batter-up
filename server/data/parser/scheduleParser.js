'use strict'
let debug = require('debug')('scheduleParser')

let gameParser = require('./gameParser')

let parser = {}

parser.parse = data => {
  let response = []

  let today = data.dates[0]

  // if for some reason there are no games today then just return nothing
  if (!today) {
    debug(`Today had no games!!!`)
    return response
  }

  debug(`parsing ${today.totalGames} games (${today.totalGamesInProgress} in progress)`)

  let games = data.dates[0].games

  games.forEach(game => {
    response.push(gameParser.parse(game))
  })

  return response
}

module.exports = parser
