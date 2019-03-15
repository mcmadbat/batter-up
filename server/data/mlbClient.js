'use strict'
const debug = require('debug')('batter-up:mlbClient')
let moment = require('moment')
let request = require('request-promise')

// parsers
let scheduleParser = require('./parser/scheduleParser')
let lineupParser = require('./parser/lineupParser')
let playerParser = require('./parser/playerParser')
let lineScoreParser = require('./parser/lineScoreParser')

const apiRootURL = `http://statsapi.mlb.com/api/v1/`
const apiRootURLV2 = `http://statsapi.mlb.com/api/v1.1/`
const sportId = 1
const rosterLookupKey = `40Man`

let basePlayers = require('./base/basePlayers').data

// dirty cache ewww
let allPlayers = {
  updated: null,
  data: basePlayers
}

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
        //promises.push(client.getGameProgress(game))
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

// returns a promise that adds the current inning of the game 
client.getGameProgressV2 = game => {
  let uri = `${apiRootURLV2}game/${game.gamePk}/feed/live`
  let options = {
    json: true,
    uri
  }

  return request(options)
    .then(response => {
      return lineScoreParser.parseV2(game, response)
    })
}

client.getGameProgress = game => {
  let uri = `${apiRootURL}game/${game.gamePk}/linescore`
  let options = {
    json: true,
    uri
  }

  return request(options)
    .then(response => {
      return lineScoreParser.parse(game, response)
    })
}

// ad hoc scrapes the api for each player
client.getAllPlayers = () => {
  let now = moment()

  if (allPlayers.updated === null || now.diff(allPlayers.updated, 'h') >= 12) {
    debug('retrieving all players')
    return client.getAllTeams()
      .then(teams => {
        let promises = teams.map(team => client.getPlayersOnTeam(team.id, team.name))

        return Promise.all(promises)
      })
      .then(data => {
        let fullList = [].concat(...data)
        let appendList = []

        debug(`retrieved ${fullList.length} players`)

        // make sure there are no duplicates
        let temp = []

        fullList.forEach(x => {
          if (!temp.find(y => y.id === x.id)) {
            temp.push(x)
          }
        })

        fullList = temp

        // update the old data
        allPlayers.data.forEach(x => {
          let found = fullList.find(p => p.id === x.id)

          if (!found) {
            appendList.push(x)
          }
        })

        debug(`appended ${appendList.length} new players`)

        allPlayers.updated = moment()
        allPlayers.data = [...fullList, ...appendList]

        return allPlayers.data
      })
  } else {
    debug(`returning cached players (n= ${allPlayers.data.length})`)
    return Promise.resolve(allPlayers.data)
  }
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

client.getPlayersOnTeam = (teamId, teamName) => {
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
          position: player.position.code,
          team: teamName
        }
      })
    })
}

module.exports = client
