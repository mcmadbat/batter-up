'use strict'

const debug = require('debug')('batter-up:worldStateManager')

let mlbclient = require('./mlbClient')
let worldState = require('./worldState')

let manager = {}

// return payload
let val = {
  data: {},
  updated: new Date()
}

let intervalObj

// flags for concurrency
let requestInProgress = false

// run #
let runNumber = 0

// separate run counter to make sure no starvation
let sinceLastRun = 0

manager.init = interval => {
  // continuously do work
  if (!intervalObj) {
    debug(`init called with interval ${interval} ms`)

    // start off by doing work
    work()

    intervalObj = setInterval(work, interval)
  }
}

manager.stop = () => {
  if (intervalObj) {
    clearInterval(intervalObj)
  }
}

manager.getState = () => {
  if (!intervalObj) {
    debug('trying to access value before init()')
  }

  return val
}

// increment for now
let work = () => {
  // wait for last request to finish, if waited too many times then do it anyways
  if (!requestInProgress || sinceLastRun > 10) {
    sinceLastRun = 0
    runNumber++

    debug(`work run # ${runNumber} started`)
    requestInProgress = true

    mlbclient.getGames().then(data => {
      // reset flag
      requestInProgress = false
      // update vlaue
      val.data = worldState.update(data)
      val.updated = new Date()

      debug(`work run # ${runNumber} finished successfully`)
    }).catch(err => {
      requestInProgress = false
      console.error(err)
      debug(`work run # ${runNumber} did not finish successfully`)
    })
  } else {
    sinceLastRun++
    debug(`previous request not finished`)
  }
}

module.exports = manager
