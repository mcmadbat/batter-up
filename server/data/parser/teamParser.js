'use strict'

// models
let Team = require('../../models/team')

let parser = {}

parser.parse = (team, isHome) => {
  return new Team(team.id, team.name, isHome)
}

module.exports = parser
