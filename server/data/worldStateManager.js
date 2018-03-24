'use strict'

let manager = {}

let val = 1

let intervalObj 

manager.init = interval => {
  // continuously do work
  if (!intervalObj) {
    console.log('init')
    intervalObj = setInterval (work, interval)
  }
}

manager.stop = () => {
  if (intervalObj) {
    clearInterval(intervalObj)
  }
}

manager.getState = () => {
  if (!intervalObj) {
    console.log('trying to access value before init')
  }

  return val
}

// increment for now
let work = () => {
  val++
}

module.exports = manager