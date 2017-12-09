#!/usr/bin/env zsh

function realpath {
    echo $1:A
}

# Native messaging manifest (mozilla)
mkdir -p ~/.mozilla/native-messaging-hosts/

ARCHIVE_PATH=$(realpath app/archive)
jq ".path = \"${ARCHIVE_PATH}\"" app/archive.json \
   > ~/.mozilla/native-messaging-hosts/archive.json

if [[ $1 ]]; then
    mkdir -p ~/.config/chromium/NativeMessagingHosts
    jq ".path = \"${ARCHIVE_PATH}\" | \
        .allowed_origins = [ \"chrome-extension://$1/\" ]" app/archive.json.chromium \
       > ~/.config/chromium/NativeMessagingHosts/archive.json
fi
