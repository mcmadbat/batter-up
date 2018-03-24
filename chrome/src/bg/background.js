chrome.extension.onConnect.addListener(function(port) {
  port.postMessage('foobar')
})

