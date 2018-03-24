// communication without background.js
let port = chrome.extension.connect({
  name: "Sample Communication"
})

port.onMessage.addListener(function(msg){
})

// testing

const URL = `https://mcmadbat.me/batterup/`

//initial 
getData()

// poll
setInterval(getData, 10000)

function getData() {
  $.ajax({
    url: URL,
    type: 'get',
    dataType: 'json',
    success: onSuccess
  })
}

function onSuccess(data) {
  console.log(data)
}


