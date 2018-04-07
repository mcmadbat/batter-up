// this massive file contains all the player data
function getPlayerData () {
  return _rawData.data.map(x => {
    x.label = x.name
    return x
  })
}

// always assume player is correct
function findPlayer (name, id) {
  let numFound = 0

  _rawData.data.forEach(p => {
    if (p.name == name) {
      numFound++
    }
  })

  // if only one guy then just do normal return
  if (numFound < 2) {
    return findPlayerByName(name)
  }

  let player = findPlayerById(id)

  if (player.name == name) {
    return player
  }

  return {
    name: 'A Player',
    position: 0,
    team: 'N/A'
  }
}

function findPlayerById (id) {
  let obj = {
    name: 'A Player',
    position: 0,
    team: 'N/A',
    id: 0
  }

  let player = _rawData.data.find(x => x.id == id)

  if (player) {
    obj.name = player.name
    obj.position = player.position
    obj.team = player.team
    obj.id = player.id
  } else {
    console.log('cant find ' + id)
  }

  return obj
}

function findPlayerByName (name) {
  let obj = {
    name: 'A Player',
    position: 0,
    team: 'N/A',
    id: 0
  }

  let player = _rawData.data.find(x => x.name == name)

  if (player) {
    obj.name = player.name
    obj.position = player.position
    obj.team = player.team
    obj.id = player.id
  } else {
    console.log('cant find ' + name)
  }

  return obj
}

// update player data
let url = `https://mcmadbat.me/batterup/allplayers/`

const oneDayInMs = 1000 * 60 * 60 * 24

getUpdatedRawPlayerData()

setInterval(function () { getUpdatedRawPlayerData() }, oneDayInMs)

function getUpdatedRawPlayerData () {
  $.ajax({
    url: url,
    type: 'get',
    dataType: 'json',
    success: updateRawPlayerData
  })
}

function updateRawPlayerData (response) {
  _rawData = response
  if (typeof updateAutocomplete !== 'undefined') {
    updateAutocomplete(getPlayerData())
  }
}
