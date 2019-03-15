'use strict'

let parser = {}

// V2 parser
parser.parseV2 = (game, response) => {
  try {
    const currentInning = response.liveData.linescore.currentInning
    const isTopInning = response.liveData.linescore.isTopInning

    game.currentInning = currentInning
    game.isTopInning = isTopInning
  } catch (error) {
    // swallow
    // console.error(error)
  }

  return game
}

// V1 parser
parser.parse = (game, response) => {
  try {
    const currentInning = response.currentInning
    const isTopInning = response.isTopInning

    game.currentInning = currentInning
    game.isTopInning = isTopInning
  } catch (error) {
    // swallow
    // console.error(error)
  }

  return game
}

module.exports = parser
