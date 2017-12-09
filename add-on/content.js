chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type == 'archive') {
            archive();
        }
    }
);

function archive() {
    chrome.runtime.sendMessage({
        type: 'archive',
        time: Date.now(),
        url: window.location.href,
        charset: document.characterSet,
        mime: document.contentType,
        css: "css stuff",
        title: document.title,
        page: document.documentElement.outerHTML });
}

archive();
