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

let contentPort;
function onConnect(p) {
    if (contentPort)
        contentPort.disconnect();
    contentPort = p;
    // Disconnect any existing proxy handlers
    contentPort.onMessage.removeListener(proxyToApp);
    port.onMessage.removeListener(proxyToContent);

    // Proxy messages between the content script and the app
    contentPort.onMessage.addListener(proxyToApp);
    port.onMessage.addListener(proxyToContent);
}
chrome.runtime.onConnect.addListener(onConnect);

function proxyToApp(message) {
    port.postMessage(message);
}
function proxyToContent(message) {
    contentPort.postMessage(message);
}

/*
  On a click on the chrome action, send the app a message.
*/
chrome.browserAction.onClicked.addListener(function () {
});
console.log("background.js loaded");

chrome.omnibox.setDefaultSuggestion({
    description: 'Search your local history using Recoll'
})


function omniboxListenWrapper(query, addSuggestions) {
    return function omniboxListen(message) {
        port.onMessage.removeListener(omniboxListen);
        console.log(query);
        console.log(message);
        if (!message.result || message.query !== query) {
            return;
        }
        let suggestions = [];
        for (let entry of message.result) {
            suggestions.push({
                content: entry.url,
                description: entry.title
            });
            // The omnibar will only show six hits
            if (suggestions.length > 5) {
                break;
            }
        }
        addSuggestions(suggestions);
    }
}

chrome.omnibox.onInputChanged.addListener(
    (text, addSuggestions) => {
        if (text.length < 3)
            return;
        port.postMessage({type: 'omnibox', query: text});
        let listener = omniboxListenWrapper(text, addSuggestions);
        port.onMessage.addListener(listener);
    }
)

chrome.omnibox.onInputEntered.addListener(
    (text, disposition) => {
        let url = text;
        console.log(text);
        if (!text.startsWith('http')) {
            url = chrome.extension.getURL(`recoll.html?q=${text}`);
        }
        switch (disposition) {
        case "currentTab":
            browser.tabs.update({url});
            break;
        case "newForegroundTab":
            browser.tabs.create({url});
            break;
        case "newBackgroundTab":
            browser.tabs.create({url, active: false});
            break;
        }
    }
)
