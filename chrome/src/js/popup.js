document.addEventListener('DOMContentLoaded', function() {
  let link = document.getElementById('addBtn')
  // onClick's logic below:
  link.addEventListener('click', handleIdInput)

  document.getElementById('notifBtn').addEventListener('click', handleNotifBtnClick)
})

let toggleNotification = true

// communication without background.js
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
  if (req.source === 'background') {
    $('#tbody').html('')

    // reset
    badgeCount = 0

    req.data
      .sort((a,b) => {
        // complex sorting algorithm
        // basically try to "estimate" how long until a player is playing again
        if (a.data.isPitching) {
          return -1
        } else if (b.data.isPitching) {
          return 1
        }

        if (a.data.gameStatus != 'L') {
          return 1
        } else if (b.data.gameStatus != 'L') {
          return -1
        }

        if (a.data.isSideBatting === b.data.isSideBatting) {
          return a.data.order - b.data.order
        }

        let left = a.data.order + (a.data.isSideBatting ? -3 : 0)
        let right = b.data.order + (b.data.isSideBatting ? -3 : 0)

        return left-right
      })
      .forEach(row => {
        populateRow(row)
      })

    // by now the badgecount should be set
    chrome.browserAction.setBadgeText({text: badgeCount.toString()})
  } else if (req.source === 'notification') {
    if (toggleNotification) {
      chrome.notifications.create('', req.data, null)
    }
  }
})

window.onload = function() {
  chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })
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

// how many are batting or pitching
let badgeCount = 0

// populating table
// expecting data to be an array of well formed json objects
function getOrder(id, data) {
  let orderTxt
  let bold = false

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
      if (!data.isSideBatting) {
        badgeCount++
        return '<b>Pitching</b>'
      } else {
        return 'Team at bat (Pitching)'
      }
    }
  } else if (order === 0) {
    orderTxt = 'Batting'
    bold = true
  } else if (order === 1) {
    orderTxt = 'On Deck'
    bold = true
  } else if (order === 2) {
    orderTxt = 'In the Hole'
    bold = true
  } else if (order <= 9) {
    orderTxt = `Due ${order + 1}th`
  } else {
    return 'Not Playing'
  }

  // notify if side is not batting
  if (!data.isSideBatting) {
    orderTxt = `On Defense (${orderTxt})`
  } else if (bold) {
    orderTxt = `<b>${orderTxt}</b>`
    badgeCount++
  }

  return orderTxt
}

function getMLBTVHtml(data) {
  let mlbtv = data.mlbTVLink

  if (data.gameStatus !== 'L') {
    return ''
  }

  //return `<a href=${mlbtv}>MLB.TV</a>`
  return `<button id=mlbtv_${name} value=${mlbtv} class='btn btn-link mlbtv-link'>MLB TV <i class="mlbtv-link-icon material-icons">launch</i></button>`
}

function populateRow(rawData) {
  let order = getOrder(rawData.id, rawData.data)
  let position = rawData.data.position ? positionMap[rawData.data.position] : ''

  let link = getMLBTVHtml(rawData.data)
  let html = convertToRow(rawData.id, rawData.data.img, rawData.data.name, order, position, link)

  $('#tbody').append(html)

  // add listener for remove buttons
  document.getElementById(`btn_${rawData.id}`).addEventListener('click', remove)

  Array.from(document.getElementsByClassName('remove-button')).forEach(element => {
    element.addEventListener('click', remove)
  })

  // mlbtv listener
  Array.from(document.getElementsByClassName('mlbtv-link')).forEach(element => {
    element.addEventListener('click', openTab)
  })

  // on error
  Array.from(document.getElementsByClassName('p-icon')).forEach(element => {
    element.addEventListener('error', handleImgNotFound)
  })
}

// convert data into an html row
function convertToRow(id, img, name, order, position, mlbtv) {
  return `
    <tr id=${id}>
      <td scope="row"><div class="image-cropper"><img class='p-icon' id=img_${id} src=${img}></img></div></td>
      <td><b>${name}</b>, <i>${position}</i></td>
      <td>${order}</td>
      <td>${mlbtv}</td>
      <td><button id=btn_${id} name=${id} class='btn remove-button'>X</button></td>
    </tr>
  `
}

function handleIdInput() {
  let name = $('#nameInput').val()
  let player = findPlayerByName(name)

  if (player.id && player.id !== 0) {
    sendMessageToBackGround('insert', player.id)
  }
}

function openTab(args) {
  let link = args.target.value
  chrome.tabs.create({url: link})
}


function remove (args) {
  let id = args.target.name

  // remove from list
  $(`#${id}`).html('')

  sendMessageToBackGround('delete', id)
}

// send a message to the background
function sendMessageToBackGround(action, data) {
  chrome.runtime.sendMessage({
    source: 'popup',
    action: action,
    data: data
  })
}

// polls the background.js to get an update
function poll() {
  chrome.runtime.sendMessage({
    source:'popup',
    action:'poll'
  })
}

function handleImgNotFound(args) {
  let id = args.target.id

  $(`#${id}`).attr('src', `http://riyadhrugby.com/mainbase/here/wp-content/uploads/2016/11/01_img_hero_player_generic.png`)
}

function handleNotifBtnClick(args) {
  let newClass = `btn `
  let text = 'Turn Off Notifications'

  if (toggleNotification) {
    newClass += ` btn-primary`
    toggleNotification = false
    text = 'Turn On Notifications'
  } else {
    newClass += ` btn-danger`
    toggleNotification = true
  }

  $('#notifBtn').attr('class', newClass).html(text)
}
