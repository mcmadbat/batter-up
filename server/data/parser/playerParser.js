'use strict'

let parser = {}

const defaultGameStatus = {
  'isCurrentBatter': false,
  'isCurrentPitcher': false,
  'isOnBench': false,
  'isSubstitute': false
}
parser.parse = player => {
  let person = player.person

  // sometimes players have no position code
  let positionCode = 0

  if (player.position) {
    positionCode = player.position.code
  }

  return {
    id: person.id,
    name: person.fullName,
    position: positionCode,
    // sometimes game status is not populated for some reason
    gameStatus: player.gameStatus === undefined ? defaultGameStatus : player.gameStatus
  }
}

parser.parseAll = players => {
  let parsedPlayers = []

  Object.keys(players).forEach(key => {
    parsedPlayers.push(parser.parse(players[key]))
  })

  return parsedPlayers
}

parser.parsePlayerInfo = player => {
  return {
    id: player.id,
    name: player.fullName,
    number: player.primaryNumber,
    position: player.primaryPosition.code
  }
}

parser.parsePlayerInfoAll = players => {
  return players.map(player => parser.parsePlayerInfo(player))
}

module.exports = parser
