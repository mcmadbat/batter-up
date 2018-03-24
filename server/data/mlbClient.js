'use strict'

// parsers
let scheduleParser = require('./parser/scheduleParser')
let lineupParser = require('./parser/lineupParser')
let playerParser = require('./parser/playerParser')

const apiRootURL = `http://statsapi.mlb.com/api/v1/`
const sportId = 1

let request = require('request-promise')

let client = {}

// { gamePk: 534187,
//   homeTeam: { id: 138, name: 'St. Louis Cardinals', isHome: true },
//   awayTeam: { id: 144, name: 'Atlanta Braves', isHome: false },
//   gameStatus: 'Final',
//   homeScore: 8,
//   awayScore: 2 }

// returns: promise that resolves to an object with today's games with
// their associated data
client.getGames = () => {
  let uri = `${apiRootURL}schedule`

  let options = {
    qs: {
      sportId
    },
    json: true,
    uri
  }

  return request(options)
    .then(response => {
      return scheduleParser.parse(response)
    })
    .then(games => {
      let promises = []

      games.forEach(game => {
        promises.push(client.getGameInfo(game))
      })

      return Promise.all(promises)
    })
}

// returns: promise that resolves to the gameData for a given pk
client.getGameInfo = game => {
  let uri = `${apiRootURL}game/${game.gamePk}/boxscore`
  let options = {
    json: true,
    uri
  }

  return request(options)
    .then(response => {
      return lineupParser.parse(game, response)
    })
}

// returns a promise that resolves to the information about players
client.getPlayerInfo = players => {
  let uri = `${apiRootURL}people`

  // mlb requires comma delimetered qs
  let personIds = players.join(',')

  let options = {
    qs: {
      personIds
    },
    json: true,
    uri
  }

  return request(options)
    .then(response => {
      return playerParser.parsePlayerInfoAll(response.people)
    })
}

module.exports = client
