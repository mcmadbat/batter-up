'use strict'

let parser = {}

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
    gameStatus: player.gameStatus
  }
}

parser.parseAll = players => {
  let parsedPlayers = []

  Object.keys(players).forEach(key => {
    parsedPlayers.push(parser.parse(players[key]))
  })

  return parsedPlayers
}

module.exports = parser
