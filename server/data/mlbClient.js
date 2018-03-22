'use strict'

let scheduleParser = require('./parser/scheduleParser')

const apiRootURL = `http://statsapi.mlb.com/api/v1/`
const mlbTVRootURL = `https://www.mlb.com/tv/g`
const sportId = 1

let request = require('request-promise')

let client = {}

// returns: promise that resolves to an object with today's games with 
// their associated data
client.getGames = () => {
  let uri = `${apiRootURL}schedule`

  let options = {
    qs: {
      sportId
    }, 
    json: true,
    uri
  }

  return request(options)
          .then(response => {
            scheduleParser.parse(response)
          })
}

module.exports = client
