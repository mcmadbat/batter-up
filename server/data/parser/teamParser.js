'use strict'

let parser = {}

parser.parse = (team, isHome) => {
  return {
    id: team.id,
    name: team.name,
    isHome
  }
}

module.exports = parser
