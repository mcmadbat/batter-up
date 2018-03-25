'use strict'

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
let expect = chai.expect

chai.use(chaiAsPromised)

let mlbClient = require('../../data/mlbClient')

describe('mlbClient', function() {
  it('getGames()', function() {
    expect(mlbClient.getGames()).to.eventually.be.fulfilled
  })
})

describe('scrape', function() {
  it('scrape!', function() {
    expect(mlbClient.getAllPlayers()).to.eventually.be.fulfilled
  })
})
