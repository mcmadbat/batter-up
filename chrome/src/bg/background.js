// google analytics
var _gaq = _gaq || []
_gaq.push(['_setAccount', 'UA-117099737-1'])
_gaq.push(['_trackPageview', '/background'])
_gaq.push(['_trackPageLoadTime']);

(function () {
  var ga = document.createElement('script')
  ga.type = 'text/javascript'; ga.async = true
  ga.src = 'https://ssl.google-analytics.com/ga.js'
  var s = document.getElementsByTagName('script')[0]
  s.parentNode.insertBefore(ga, s)
})()

// in ms
const pollingInterval = 6000

// sleep longer if no games currently up
const sleepPollingInterval = 1000 * 60

let curInterval = pollingInterval

// poll
let intervalObj = setInterval(getData, pollingInterval)

// needed for notifications
let currentBatting = [], previousCurrentBatting = []
let currentPitching = [], previousCurrentPitching = []

let badgeCount = 0
let showNotification = true
let isMuted = false

let notifMap = {}

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
      console.log(`sent showNotification=${showNotification}`)
      chrome.runtime.sendMessage({
        source: 'notification',
        data: showNotification
      })
    } else if (req.action === 'getIsMuted') {
      console.log(`sent isMuted=${isMuted}`)
      chrome.runtime.sendMessage({
        source: 'mute',
        data: isMuted
      })
    } else if (req.action === 'toggleMute') {
      isMuted = !isMuted
      console.log(`toggled isMute=${isMuted}`)
      saveMuteSettings()
    }
  }
})

const playerIdKey = 'playerIds'

let playerIds = []

chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })

getNotifSetting()
getIdsFromStorage()
getMuteSettings()

const mlbTVRootURL = `https://www.mlb.com/tv/g`
const URL = `https://mcmadbat.me/batterup/`
// debug url
// const URL = `http://localhost:3000/`
const headshotURL = `http://mlb.mlb.com/mlb/images/players/head_shot/`

// cached data
let cachedData = []

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

  // if for some reason there aren't any games manually set it to an array
  if (Object.keys(games).length === 0) {
    games = []
  }

  if (!games.find(x => x.gameStatus.abstractGameCode == 'L') && curInterval != sleepPollingInterval) {
    clearInterval(intervalObj)
    // set to longer term
    intervalObj = setInterval(getData, sleepPollingInterval)
    curInterval = sleepPollingInterval
  } else if (curInterval != pollingInterval) {
    clearInterval(intervalObj)
    // set to longer term
    intervalObj = setInterval(getData, curInterval)
    curInterval = pollingInterval
  }
  // clear the table body
  $('#tbody').html('')

  // proccess the response and find the relevant information for the players
  playerIds
    .filter(x => playerIds.includes(x))
    .forEach(id => {
      // if there are two games find the one that is live
      let game = games.find(game => game.players && game.players.map(x => x.id).includes(id))
      let liveGame = games.find(game => game.players && game.players.map(x => x.id).includes(id) && game.gameStatus.abstractGameCode == 'L')

      if (liveGame) {
        game = liveGame
      }

      let row = {
        id,
        data: {
          gameStatus: null,
          order: 999,
          isPitching: false,
          isSideBatting: false,
          img: `${headshotURL}${id}.jpg`,
          homeTeam: null,
          homeScore: 0,
          awayTeam: null, 
          awayScore: 0,
          currentInning: 0,
          isTopInning: false
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

          if (id === game.currentAwayPitcher && game.currentTeamAtBat === 'away') {
            row.data.isSideBatting = true
          }

          if (id === game.currentHomePitcher && game.currentTeamAtBat === 'home') {
            row.data.isSideBatting = true
          }

          row.data.order = row.data.isPitching ? -1 : 99
        }

        // team abbreviations 
        row.data.homeTeam = game.homeTeam.abbreviation
        row.data.awayTeam = game.awayTeam.abbreviation

        // current scores
        row.data.homeScore = game.homeScore ? game.homeScore : 0
        row.data.awayScore = game.awayScore ? game.awayScore : 0

        // inning information
        row.data.currentInning = game.currentInning 
        row.data.isTopInning = game.isTopInning
        
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

        if (row.data.isSideBatting && row.data.order == 0 && game.gameStatus.abstractGameCode == 'L') {
          currentBatting.push(row)
        }

        if (row.data.isPitching && !row.data.isSideBatting && game.gameStatus.abstractGameCode == 'L') {
          currentPitching.push(row)
        }

        if (game.gameStatus.abstractGameCode != 'L') {
          row.data.order = 999
          row.data.isPitching = false
        }

        // game time 
        if (game.gameTime) {
          row.data.gameTime = game.gameTime
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

  data[playerIdKey] = playerIds

  // set player IDS
  chrome.storage.sync.set(data, function () {
  })
  
}
// storage helpers
function getIdsFromStorage () {
  // load player IDs
  chrome.storage.sync.get([playerIdKey], function (result) {
    if (result[playerIdKey]) {
      playerIds = result[playerIdKey]

      // initial
      getData()
    }
  })
}

function sendNotifications () {
  // clear the map
  notifMap = {}

  let notifData = null

  let newBatters = []
  let newPitchers = []

  let buttons = [{title: 'MLB.TV'}]

  let gameLink

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
    gameLink = newBatters[0].data.mlbTVLink

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
      iconUrl: '../../icons/icon128.png',
      buttons
    }
  }

  if (newPitchers.length !== 0) {
    let message = newPitchers[0].data.name
    gameLink = newPitchers[0].data.mlbTVLink

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
      iconUrl: '../../icons/icon128.png',
      buttons
    }
  }

  // reset
  previousCurrentBatting = currentBatting
  previousCurrentPitching = currentPitching

  currentBatting = []
  currentPitching = []

  if (notifData && showNotification) {
    playAudioCue()
    chrome.notifications.create('', notifData, id => {
      notifMap[id] = gameLink
    })
    _gaq.push(['_trackEvent', gameLink, 'sent notification'])
  }
}

function getNotifSetting () {
  chrome.storage.sync.get(['notif'], function (result) {
    if (result) {
      showNotification = result['notif']

      if (showNotification == undefined) {
        showNotification = true
      }
    }
  })
}

function saveNotifSettings () {
  chrome.storage.sync.set({
    'notif': showNotification
  }, function () {})
}

function playAudioCue () {
  let cue = new Audio('../../audio/notification.mp3')
  if (!isMuted) {
    cue.play()
  }
}

function saveMuteSettings () {
  chrome.storage.sync.set({
    'isMuted': isMuted
  }, function () {})
}

function getMuteSettings () {
  chrome.storage.sync.get(['isMuted'], function (result) {
    if (result) {
      isMuted = result['isMuted']

      if (isMuted == undefined) {
        isMuted = false
      }
    }
  })
}

chrome.notifications.onButtonClicked.addListener((notifId, btnId) => {
  if (notifMap[notifId]) {
    // open a new tab
    chrome.tabs.create({url: notifMap[notifId]})
    _gaq.push(['_trackEvent', notifMap[notifId], 'opened mlb.tv'])
  }
})
