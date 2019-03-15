'use strict'

const debug = require('debug')('batter-up:worldState')

// needs the old and new state so that a comparison can be made when teams switch sides
// this way we can also keep track of batting order when the team is in the field
let state = []
let oldState = []

let once = false

// updates intelligently
// takes in the raw http resposne from mlbClient
state.update = data => {
  try {
    // switch states
    oldState = state
    state = data

    // go through each game and see if the current batting team has changed

    if (!once) {
      once = false

      state
        // filter out all the games that have linup data
        .filter(game => game.homeTeam.battingOrder !== null && game.homeTeam.battingOrder !== undefined)
        .forEach(game => {
          let oldGame = oldState.find(oldGame => oldGame.gamePk === game.gamePk)
          if (oldGame) {
            updateCurrentBatterInfo(game, oldGame)
            updateCurrentPitcherInfo(game, oldGame)
          }
        })
    }
    
    return state
  } catch (err) {
    debug(`reverting to old state`)
    console.error(err)
    // something has gone wrong, revert to old state
    return oldState
  }
}

// update the current batter info for the team that is not up to bat
let updateCurrentBatterInfo = (newGame, oldGame) => {
  // just fill in the old info
  // it doesn't matter if the actual side has switched
  if (!newGame.currentHomeBatter) {
    newGame.currentHomeBatter = oldGame.currentHomeBatter
  } else {
    newGame.currentAwayBatter = oldGame.currentAwayBatter
  }
  // if it is still null then it is probably the first batter in the lineup
  if (!newGame.currentHomeBatter) {
    newGame.currentHomeBatter = newGame.homeTeam.battingOrder[0]
  } else if (!newGame.currentAwayBatter) {
    newGame.currentAwayBatter = newGame.awayTeam.battingOrder[0]
  }
}

let updateCurrentPitcherInfo = (newGame, oldGame) => {
  // fill in the old info if any needed
  if (!newGame.currentHomePitcher) {
    newGame.currentHomePitcher = oldGame.currentHomePitcher
  }

  if (!newGame.currentAwayPitcher) {
    newGame.currentAwayPitcher = oldGame.currentAwayPitcher
  }
}

module.exports = state
