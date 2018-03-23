'use strict'

let expect = require('chai').expect

let worldState = require('../../data/worldState')

describe('worldState', function() {
  let sampleGames = getSampleGames()

  describe('games', function() {
    it('set/get', function() {
      let gs = new worldState()
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