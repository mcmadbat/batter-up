'use strict'

let playerParser = require('./playerParser')

let parser = {}

// game: in the game object to append the data to
// response: the http reponse to parse
parser.parse = (game, response) => {
  let away = response.teams.away
  let home = response.teams.home

  game.awayTeam.battingOrder = away.battingOrder
  game.homeTeam.battingOrder = home.battingOrder

  game.awayTeam.bullpen = away.bullpen
  game.homeTeam.bullpen = home.bullpen

  game.awayTeam.bench = away.bench
  game.homeTeam.bench = home.bench

  let awayPlayers = playerParser.parseAll(away.players)
  let homePlayers = playerParser.parseAll(home.players)

  // for now don't include all the players
  // game.awayTeam.players = awayPlayers
  // game.homeTeam.players = homePlayers

  let currentBatter
  let currentPitcher

  // find the current Batter and current Pitcher
  [...awayPlayers, ...homePlayers].forEach(player => {
    if (player.gameStatus.isCurrentBatter) {
      currentBatter = player.id
    }
    if (player.gameStatus.isCurrentPitcher) {
      currentPitcher = player.id
    }
  })

  game.currentBatter = currentBatter
  game.currentPitcher = currentPitcher

  return game
}

module.exports = parser
