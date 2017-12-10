/*
On startup setup a port to the archive script
*/
var port = chrome.runtime.connectNative("archive");
port.onMessage.addListener((message) => {
    console.log(message);
})
console.log("connected to port:");
console.log(port);
// Restart if something goes wrong (not sure if this actually works when if the script crashes)
port.onDisconnect.addListener(function (message) {
    port = chrome.runtime.connectNative("archive");
});

// Re-route messages from the content to the archive script
function listener(message) {
    if (message.type == 'archive') {
        console.log("archive: " + message.url);
        console.log('charset' + message.charset);
        port.postMessage(message);
    }
    else {
        console.log("got ack: " + message);
        console.log(message);
    }
}
chrome.runtime.onMessage.addListener(listener);
/*
  On a click on the chrome action, send the app a message.
*/
chrome.browserAction.onClicked.addListener(function () {
    console.log("Search");
    port.postMessage({ type: 'search' })
});
console.log("background.js loaded");
