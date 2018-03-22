'use strict'

let expect = require('chai').expect

let gameState = require('../../data/gameState')

describe('GameState', function() {
  let sampleGames = getSampleGames()

  describe('games', function() {
    it('set/get', function() {
      let gs = new gameState()
      gs.setGames(sampleGames)

      let gamePks = Object.keys(sampleGames)

      expect(gs.getGamesPks()).to.be.eql(gamePks)
    })
  })
})

// returns a sample object containing (gamePk: games)
function getSampleGames() {
  return {
    1: {},
    2: {},
    3: {}
  }
}