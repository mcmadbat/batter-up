document.addEventListener('DOMContentLoaded', function() {
  let link = document.getElementById('addBtn');
  // onClick's logic below:
  link.addEventListener('click', handleIdInput);
})

// communication without background.js
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
  if (req.source === 'background') {
    $('#tbody').html('')
    console.log(req.data)
    req.data.forEach(row => {
      populateRow(row)
    })
  }
})

window.onload = function() {
  poll()
}

const positionMap = [
  'n/a',
  'P',
  'C',
  '1B',
  '2B',
  '3B',
  'SS',
  'LF',
  'CF',
  'RF',
  'DH'
]

// populating table
// expecting data to be an array of well formed json objects
function getOrder(data) {
  if (!data.gameStatus) {
    return 'Not Playing'
  } else if (data.gameStatus === 'F') {
    return 'Game Finished'
  } else if (data.gameStatus !== 'L') {
    return 'Game Not Started'
  }

  let order = data.order

  if (order === -1) {
    if (data.isPitching) {
      order = 'Currently Pitching'
    } else {
      order = 'Not Playing'
    }
  } else if (order === 0) {
    order = 'Batting'
  } else if (order === 1) {
    order = 'On Deck'
  } else if (order === 2) {
    order = 'In the hole'
  } else {
    order = `Due ${order + 1}th`
  }

  return order
}

function getMLBTVHtml(data) {
  let mlbtv = data.mlbTVLink

  if (data.gameStatus !== 'L') {
    return ''
  }

  return `<a href=${mlbtv}>MLB.TV</a>`
}

function populateRow(rawData) {
  let order = getOrder(rawData.data)
  let position = positionMap[rawData.data.position]

  let link = getMLBTVHtml(rawData.data)
  let html = convertToRow(rawData.id, rawData.data.img, rawData.data.name, order, position, link)
  
  $('#tbody').append(html)

  // add listener
  document.getElementById(`btn_${rawData.id}`).addEventListener('click', remove)
}

// convert data into an html row
function convertToRow(id, img, name, order, position, mlbtv) {
  return `
    <tr id=${id}>
      <td scope="row"><img src=${img}></img><b>${name}</b> <i>${position}</i></td>
      <td>${order}</td>
      <td>${mlbtv}</td>
      <td><button id=btn_${id} name=${id} class='btn'> remove</btn></td>
    </tr>
  `
}

$( function() {
    var players = [
      {
        playerId: "ajudge",
        label: "Aaron Judge",
        desc: "A batter in NYC",
        icon: "aaron.png"
      },
      {
        playerId: "apudge",
        label: "Aaron Pudge",
        desc: "A batter in Scarborough",
        icon: "david.png"
      }
    ];
 
    $( "#player" ).autocomplete({
      minLength: 0,
      source: players,
      messages: {
        noResults: '',
        results: function() {}
    },
      focus: function( event, ui ) {
        $( "#player" ).val( ui.item.label );
        return false;
      },
      select: function( event, ui ) {
        $( "#player" ).val( ui.item.label );
        $( "#player-id" ).val( ui.item.playerId );
        $( "#player-description" ).html( ui.item.desc );
        $( "#player-icon" ).attr( "src", "icons/" + ui.item.icon );
 
        return false;
      }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li>" )
        .append( "<div>" + item.label + "<br>" + item.desc + "</div>" )
        .appendTo( ul );
    };
  } );

function handleIdInput() {
  let id = $('#player').val()

  // force int
  id = parseInt(id)

  sendMessageToBackGround('insert', id)
}

function remove (args) {
  let id = args.target.name
  
  // remove from list 
  $(`#${id}`).html('')

  sendMessageToBackGround('delete', id)


}

function sendMessageToBackGround(action, data) {
  chrome.runtime.sendMessage({
    source: 'popup',
    action: action,
    data: data
  })
}

function poll() {
  chrome.runtime.sendMessage({
    source:'popup',
    action:'poll'
  })
}
