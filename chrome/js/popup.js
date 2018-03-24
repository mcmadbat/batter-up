// communication without background.js
let port = chrome.extension.connect({
  name: "Sample Communication"
})

port.onMessage.addListener(function(msg){
  console.log(msg)
})