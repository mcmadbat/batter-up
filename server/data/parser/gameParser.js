'use strict'

// parsers
let teamParser = require('./teamParser')

const mlbTVRootURL = `https://www.mlb.com/tv/g`

let parser = {}

parser.parse = game => {
  let homeTeam = teamParser.parse(game.teams.home.team, true)
  let awayTeam = teamParser.parse(game.teams.away.team, false)

  let gameStatus = game.status

  // set to -1 for games not in progress
  let awayScore = -1
  let homeScore = -1

  awayScore = game.teams.away.score
  homeScore = game.teams.home.score

  return {
    gamePk: game.gamePk,
    mlbTV: `${mlbTVRootURL}${game.gamePk}`,
    homeTeam,
    awayTeam,
    gameStatus,
    homeScore,
    awayScore
  }
}

module.exports = parser
