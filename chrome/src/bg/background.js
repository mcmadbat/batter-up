// in ms
const pollingInterval = 10000

// poll
let intervalObj = setInterval(getData, pollingInterval)

// needed for notifications
let currentBatting = [], previousCurrentBatting = []
let currentPitching = [], previousCurrentPitching = []

let badgeCount = 0

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  if (req.source === 'popup') {
    if (req.action === 'poll') {
      sendMessageToPopup(cachedData)
    } else if (req.action === 'insert') {
      let id = req.data

      if (playerIds.includes(id)) {
        return
      }

      playerIds.push(id)
      pushIdsToStorage()
      clearInterval(intervalObj)
      getData()
      intervalObj = setInterval(getData, pollingInterval)
    } else if (req.action === 'delete') {
      clearInterval(intervalObj)

      let id = req.data

      playerIds = playerIds.filter(x => x != id)

      pushIdsToStorage()

      getData()
      intervalObj = setInterval(getData, pollingInterval)
    } else if (req.action === 'toggleNotif') {
      showNotification = req.data
      saveNotifSettings()
    } else if (req.action === 'getNotif') {
      chrome.runtime.sendMessage({
        source: 'notification',
        data: showNotification
      })
    }
  }
})

let showNotification = true
const playerIdKey = 'playerIds'

let playerIds = []

chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })

getNotifSetting()
getIdsFromStorage()

const mlbTVRootURL = `https://www.mlb.com/tv/g`
const URL = `https://mcmadbat.me/batterup/`
const headshotURL = `http://mlb.mlb.com/mlb/images/players/head_shot/`

// cached data
let cachedData = []

// initial
getData()

function getData () {
  $.ajax({
    url: URL,
    type: 'get',
    dataType: 'json',
    success: onSuccess
  })
}

function onSuccess (response) {
  let games = response.data
  let rows = []

  // clear the table body
  $('#tbody').html('')

  // proccess the response and find the relevant information for the players
  playerIds
    .filter(x => playerIds.includes(x))
    .forEach(id => {
      let game = games.find(game => game.players && game.players.map(x => x.id).includes(id))

      let row = {
        id,
        data: {
          gameStatus: null,
          order: 999,
          isPitching: false,
          isSideBatting: false,
          img: `${headshotURL}${id}.jpg`
        }
      }

      if (game) {
        row.data.order = 99

        row.data.mlbTVLink = `${mlbTVRootURL}${game.gamePk}`

        row.data.gameStatus = game.gameStatus.abstractGameCode

        let player = game.players.find(x => x.id === id)

        row.data.position = player.position
        row.data.name = player.name

        // treat batters and pitchers differently
        if (row.data.position == 1) {
          row.data.isPitching = game.currentAwayPitcher === id || game.currentHomePitcher === id
          row.data.order = row.data.isPitching ? -1 : 99
        }

        let homeOrder = game.homeTeam.battingOrder
        let awayOrder = game.awayTeam.battingOrder

        // home or away
        if (homeOrder.includes(id)) {
          row.data.isSideBatting = game.currentTeamAtBat === 'home'

          row.data.order = (9 + homeOrder.indexOf(id) - homeOrder.indexOf(game.currentHomeBatter)) % 9
        } else if (awayOrder.includes(id)) {
          row.data.isSideBatting = game.currentTeamAtBat === 'away'

          row.data.order = (9 + awayOrder.indexOf(id) - awayOrder.indexOf(game.currentAwayBatter)) % 9
        }

        // if a pitcher is pitching (on the field)
        // AND in lineup, then show that they are pitching
        if (row.data.isPitching && row.data.order !== -1 && !row.data.isSideBatting) {
          row.data.order = -1
        }

        if (row.data.isSideBatting && row.data.order == 0) {
          currentBatting.push(row)
        }

        if (row.data.isPitching && !row.data.isSideBatting) {
          currentPitching.push(row)
        }

        if (game.gameStatus.abstractGameCode != 'L') {
          row.data.order = 999
          row.data.isPitching = false
        }
      } else {
      // TODO: have to populate another way
        let playerFromBackup = findPlayerById(id)
        row.data.name = playerFromBackup.name
        row.data.position = parseInt(playerFromBackup.position)
        row.data.team = playerFromBackup.team
      }

      rows.push(row)
    })
  cachedData = rows
  sendMessageToPopup(rows)
  sendNotifications()
}

function sendMessageToPopup (data) {
  chrome.runtime.sendMessage({
    source: 'background',
    data: data
  })
}

// storage helpers
function pushIdsToStorage () {
  let data = {
    playerIdKey: playerIds
  }
  // set player IDS
  chrome.storage.sync.set(data, function () {
  })
}
// storage helpers
function getIdsFromStorage () {
  // load player IDs
  chrome.storage.sync.get([playerIdKey], function (result) {
    if (result[0]) {
      playerIds = result[0][playerIdKey].ids
    }
  })
}

function sendNotifications () {
  if (!showNotification) {
    return
  }

  let notifData = null

  let newBatters = []
  let newPitchers = []

  currentBatting.forEach(batter => {
    if (!previousCurrentBatting.find(x => x.id == batter.id)) {
      newBatters.push(batter)
    }
  })

  currentPitching.forEach(pitcher => {
    if (!previousCurrentPitching.find(x => x.id === pitcher.id)) {
      newPitchers.push(pitcher)
    }
  })

  badgeCount = currentBatting.length + currentPitching.length
  
  // by now the badgecount should be set
  chrome.browserAction.setBadgeText({text: badgeCount.toString()})

  if (newBatters.length !== 0) {
    let message = newBatters[0].data.name

    if (currentBatting.length > 1) {
      message += ` and ${currentBatting.length - 1} others are `
    } else {
      message += ' is '
    }

    message += 'up to bat!'

    notifData = {
      type: 'basic',
      title: `Batter Up!`,
      message: message,
      iconUrl: '../../icons/icon128.png'

    }
  }

  if (newPitchers.length !== 0) {
    let message = newPitchers[0].data.name

    if (currentPitching.length > 1) {
      message += ` and ${currentPitching.length - 1} others are `
    } else {
      message += ' is '
    }

    message += 'pitching!'

    notifData = {
      type: 'basic',
      title: `Batter Up!`,
      message: message,
      iconUrl: '../../icons/icon128.png'

    }
  }

  // reset
  previousCurrentBatting = currentBatting
  previousCurrentPitching = currentPitching

  currentBatting = []
  currentPitching = []

  if (notifData) {
    chrome.notifications.create('', notifData, null)
  }
}

function getNotifSetting () {
  chrome.storage.sync.get(['notif'], function (result) {
    if (result[0]) {
      showNotification = result[0]['notif']
    }
  })
}

function saveNotifSettings () {
  chrome.storage.sync.set({
    'notif': showNotification
  }, function () {})
}
