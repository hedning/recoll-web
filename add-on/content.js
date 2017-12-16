chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type == 'archive') {
            archive();
        }
    }
);

function archive() {
    if (chrome.extension.inIncognitoContext) {
        return;
    }
    chrome.runtime.sendMessage({
        type: 'archive',
        url: window.location.href,
        charset: document.characterSet,
        mime: document.contentType,
        page: document.documentElement.outerHTML });
}

archive();
