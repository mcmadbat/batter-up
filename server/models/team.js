'use strict'

class Team {
  constructor(teamId, name, isHome) {
    this.teamId = teamId
    this.name = name
    this.isHome = isHome
  }

  getTeamId() {
    return this.teamId
  }

  getName() {
    return this.name
  }

  getIsHome() {
    return this.isHome
  }
}

module.exports = Team
