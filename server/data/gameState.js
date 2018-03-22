'use strict'

// the internal game state
class GameState {
  constructor () {
    // (gamePk: game)
    this.games = {}
  }

  /*
    Getters and Setters
  */

  // sets the games
  setGames (games) {
    this.games = games
  }

  // get today's games
  getGamesPks () {
    return Object.keys(this.games)
  }

  getGame (gamePk) {
    return this.games.gamePk
  }
}

module.exports = GameState
