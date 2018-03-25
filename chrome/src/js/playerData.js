// this massive file contains all the player data
function getPlayerData() {
  return _rawData.data.map(x => {
    x.label = x.name
    return x
  })
}

function findPlayerByID(id) {
  let obj = {
    name: "A Player",
    position: 0
  }

  let player = _rawData.data.find(x => x.id == id)

  if (player) {
    obj.name = player.name
    obj.position = player.position
  }
  
  return obj
}