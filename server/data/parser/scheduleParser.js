'use strict'
let debug = require('debug')('scheduleParser')

let gameParser = require('./gameParser')

let parser = {}

parser.parse = data => {
  let response = {}

  let today = data.dates[0]

  debug(`parsing ${today.totalGames} games (${today.totalGamesInProgress} in progress)`)

  let games = data.dates[0].games

  games.forEach(game => {
    response[game.gamePk] = gameParser.parse(game)
  })

  return response
}

module.exports = parser
