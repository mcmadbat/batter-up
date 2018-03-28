// this massive file contains all the player data
function getPlayerData () {
  return _rawData.data.map(x => {
    x.label = x.name
    return x
  })
}

function findPlayerById (id) {
  let obj = {
    name: 'A Player',
    position: 0,
    team: 'N/A'
  }

  let player = _rawData.data.find(x => x.id == id)

  if (player) {
    obj.name = player.name
    obj.position = player.position
    obj.team = player.team
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
}
