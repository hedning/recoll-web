let searchbox = document.getElementById('searchbox');
let output = document.getElementById('output');

let port = chrome.runtime.connect();
let disconnected = false;
port.onDisconnect.addListener(() => {
    disconnected = true;
})

function searchHandler(message) {
    if (message.query !== searchbox.value ||
        message.snippet === undefined) {
        return;
    }
    let div = document.createElement('div');

    let title = document.createElement('h5');
    title.innerHTML = message.title;
    let snippet = document.createElement('p');
    snippet.innerHTML = message.snippet;
    let url = document.createElement('a');
    url.setAttribute('href', message.url);
    url.innerHTML = message.url;

    div.appendChild(title);
    div.appendChild(snippet);
    div.appendChild(url);
    output.appendChild(div);
}

let timer;
function search() {
    output.innerHTML = "";
    window.clearTimeout(timer);
    timer = window.setTimeout(postSearch, 200);
}

function postSearch(force) {
    let query = searchbox.value;
    if (query.length < 3 && !force) {
        return;
    }
    port.postMessage(
        {type: 'search',
         query: query}
    );
}

port.onMessage.addListener(searchHandler);

searchbox.addEventListener(
    'input',
    (e) => {
        if (disconnected) {
            port = chrome.runtime.connect();
            port.onMessage.addListener(searchHandler);
            disconnected = false;
        }
        search();
})

searchbox.addEventListener(
    'change',
    (e) => {
        if (disconnected) {
            port = chrome.runtime.connect();
            port.onMessage.addListener(searchHandler);
            disconnected = false;
        }
        postSearch();
    }
)

searchbox.value = decodeURI(location.search.substring(3));
postSearch();
searchbox.focus();
