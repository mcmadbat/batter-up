'use strict'

let playerParser = require('./playerParser')

let parser = {}

// game: in the game object to append the data to
// response: the http reponse to parse
parser.parse = (game, response) => {
  let away = response.teams.away
  let home = response.teams.home

  game.awayTeam.abbreviation = away.team.abbreviation
  game.homeTeam.abbreviation = home.team.abbreviation

  game.awayTeam.battingOrder = away.battingOrder
  game.homeTeam.battingOrder = home.battingOrder

  game.awayTeam.bullpen = away.bullpen
  game.homeTeam.bullpen = home.bullpen

  game.awayTeam.bench = away.bench
  game.homeTeam.bench = home.bench

  let awayPlayers = playerParser.parseAll(away.players)
  let homePlayers = playerParser.parseAll(home.players)

  // // for now don't include all the players
  // game.awayTeam.players = awayPlayers
  // game.homeTeam.players = homePlayers

  game.players = [...awayPlayers, ...homePlayers].map(player => {
    return {
      id: player.id,
      name: player.name,
      position: player.position
    }
  })

  // return information regarding the team of the current players
  // this way we can later process the order even though
  let currentHomeBatter = null
  let currentAwayBatter = null

  let currentHomePitcher = null
  let currentAwayPitcher = null

  // need to process home and away separately
  awayPlayers.forEach(player => {
    if (player.gameStatus.isCurrentBatter) {
      currentAwayBatter = player.id
    }

    if (player.gameStatus.isCurrentPitcher) {
      currentAwayPitcher = player.id
    }
  })

  homePlayers.forEach(player => {
    if (player.gameStatus.isCurrentBatter) {
      currentHomeBatter = player.id
    }

    if (player.gameStatus.isCurrentPitcher) {
      currentHomePitcher = player.id
    }
  })

  game.currentHomeBatter = currentHomeBatter
  game.currentAwayBatter = currentAwayBatter

  game.currentAwayPitcher = currentAwayPitcher
  game.currentHomePitcher = currentHomePitcher

  // set the current team at bat to help facilitate parsing later
  game.currentTeamAtBat = currentHomeBatter === null ? 'away' : 'home'

  return game
}

module.exports = parser
