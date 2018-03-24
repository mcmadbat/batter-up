// communication without background.js
let port = chrome.extension.connect({
  name: "Sample Communication"
})

port.onMessage.addListener(function(msg){
})

let playerIds = [656846]

// populating table
// expecting data to be an array of well formed json objects
function populateRow(rawData) {
  console.log(rawData)
}

// convert data into an html row
function convertToRow(id, img, order, link) {
  return `
    <tr>
      <td scope="row"><img src=${img}></img>${name}</td>
      <td>${order}</td>
      <td><a href=${link}>MLB.TV</a></td>
    </tr>
  `
}

// testing

const URL = `https://mcmadbat.me/batterup/`

//initial 
getData()

// poll
setInterval(getData, 30000)

function getData() {
  $.ajax({
    url: URL,
    type: 'get',
    dataType: 'json',
    success: onSuccess
  })
}

function onSuccess(response) {
  let games = response.data

  // clear the table body
  $('#tbody').html('')

  // proccess the response and find the relevant information for the players
  playerIds.forEach(id => {
    let row = {
      id,
      data: {
        isPlaying: false
      }
    }

    let game = games.find(game => game.players.map(x => x.id).includes(id))

    if (game) {
      row.data.isPlaying = truex
    }

    populateRow(row)
  })
}


