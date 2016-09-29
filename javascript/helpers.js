const EVENT_LOG = 1, LOGIC_LOG = 2, TEMP_LOG = 3, STORE_LOG = 4;
const logEvents = false, logLogic = false, logTemp = true, logStore = true;

function cleanURL(url) {
    const length = url.length;
    var startIndex = 0, finishIndex = length, i;
    for (i = 0; i < length; ++i) {
        if (url.charAt(i) == ':') {
            startIndex = i + 3;
            break;
        }
    }
    if (url.substr(startIndex,4) == "www.") {
        startIndex += 4;
    }
    for (i = startIndex; i < length; ++i) {
        if (url.charAt(i) == '/') {
            finishIndex = i;
            break;
        }
    }
    return url.substr(startIndex, finishIndex - startIndex);
}

function log(text, type) {
    type = type || 0;
    if (type == EVENT_LOG && logEvents) {
        console.log("EVENT:" + text);
    }
    else if (type == LOGIC_LOG && logLogic) {
        console.log("LOGIC:" + text);
    }
    else if (type == TEMP_LOG && logTemp) {
        console.log("TEMP:" + text);
    }
    else if (type == STORE_LOG && logStore) {
        console.log("STORE:" + text);
    }
    else if (type == 0){
        console.log(text);
    }
}
function logMemoryUsed(item) {
    item = item || null;
    storage.getBytesInUse(item,function (bytes) {
        log("Bytes used:" + bytes + " - " + ((100 * bytes)/storage.QUOTA_BYTES).toFixed(2) + "%", STORE_LOG);
    });
}
function persistInstallTime() {
    storage.set({'value': new Date()}, function() {
        log("time stored", STORE_LOG);
    });
}

function retrieveInstallTime() {
    storage.get('value', function(value) {
        log("time installed: " + String(new Date(value)), STORE_LOG);
    });
}
logMemoryUsed();

persistInstallTime();
logMemoryUsed();
retrieveInstallTime();

logMemoryUsed();

retrieveInstallTime();