'use strict'
const debug = require('debug')('batter-up:mlbClient')

// parsers
let scheduleParser = require('./parser/scheduleParser')
let lineupParser = require('./parser/lineupParser')
let playerParser = require('./parser/playerParser')

const apiRootURL = `http://statsapi.mlb.com/api/v1/`
const sportId = 1
const rosterLookupKey = `fullRoster`

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

// ad hoc scrapes the api for each player
client.getAllPlayers = () => {
  debug('retrieving all players')
  return client.getAllTeams()
    .then(teams => {
      let promises = teams.map(team => client.getPlayersOnTeam(team.id))

      return Promise.all(promises)
    })
    .then(data => {
      let fullList = [].concat(...data)
      debug(`retrieved ${fullList.length} players`)
      return fullList
    })
}

client.getAllTeams = () => {
  let uri = `${apiRootURL}teams`

  let options = {
    qs: {
      sportId
    },
    json: true,
    uri
  }

  return request(options)
    .then(response => {
      // 103 = AL, 104 = NL
      let teams = response.teams.filter(team => team.league.id === 103 || team.league.id === 104)
      return teams.map(team => {
        return {
          id: team.id,
          name: team.abbreviation
        }
      })
    })
}

client.getPlayersOnTeam = (teamId) => {
  let uri = `${apiRootURL}teams/${teamId}/roster/${rosterLookupKey}`

  let options = {
    uri,
    json: true
  }

  return request(options)
    .then(response => {
      return response.roster.map(player => {
        return {
          id: player.person.id,
          name: player.person.fullName,
          position: player.position.code
        }
      })
    })
}

module.exports = client
