'use strct'

class Game {
  constructor(gamePk, gameDate, awayTeam, homeTeam, gameStatus, awayScore, homeScore) {
    this.gamePk = gamePk
    this.gameDate = gameDate
    this.awayTeam = awayTeam
    this.homeTeam = homeTeam
    this.gameStatus = gameStatus
    this.awayScore = awayScore
    this.homeScore = homeScore
  }

  getGamePk() {
    return this.gamePk
  }

  getGameDate() {
    return this.gameDate
  }

  getAwayTeam() {
    return this.awayTeam
  }

  getHomeTeam() {
    return this.homeTeam
  }

  getGameStatus() {
    return this.gameStatus
  }

  getAwayScore() {
    return this.awayScore
  }

  getHomeScore() {
    return this.homeScore
  }
}

module.exports = Game
