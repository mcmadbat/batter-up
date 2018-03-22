'use strict'

// models
let Game = require('../../models/game')

// parsers
let teamParser = require('./teamParser')

let parser = {}

parser.parse = game => {
  let homeTeam = teamParser.parse(game.teams.home.team, true)
  let awayTeam = teamParser.parse(game.teams.away.team, false)

  let gameStatus = game.status.detailedState

  // set to -1 for games not in progress
  let awayScore = -1, homeScore = -1

  awayScore = game.teams.away.score
  homeScore = game.teams.home.score

  return new Game(game.gamePk, game.gameDate, awayTeam, homeTeam, gameStatus, awayScore, homeScore) 
}

module.exports = parser
