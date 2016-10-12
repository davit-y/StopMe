const EVENT_LOG = 1, LOGIC_LOG = 2, TEMP_LOG = 3, STORE_LOG = 4;
const logEvents = false, logLogic = true, logTemp = true, logStore = true;

function cleanURL(url) {
    const length = url.length;
    var startIndex = 0, finishIndex = length, i;
    for (i = 0; i < length; ++i) {
        if (url.charAt(i) == ':') {
            startIndex = i + 3;
            break;
        }
    }
    if (url.substr(startIndex, 4) == "www.") {
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
        console.log("EVENT: " + text);
    }
    else if (type == LOGIC_LOG && logLogic) {
        console.log("LOGIC: " + text);
    }
    else if (type == TEMP_LOG && logTemp) {
        console.log("TEMP: " + text);
    }
    else if (type == STORE_LOG && logStore) {
        console.log("STORE: " + text);
    }
    else if (type == 0) {
        console.log(text);
    }
}
function logMemoryUsed(item) {
    item = item || null;
    storage.getBytesInUse(item, function (bytes) {
        log("Bytes used:" + bytes + " - " +
            ((100 * bytes) / storage.QUOTA_BYTES).toFixed(2) + "%", STORE_LOG);
    });
}
function persistInstallTime() {
    storage.set({'install_time': new Date()}, function () {
        log("time stored", STORE_LOG);
    });
}

function retrieveInstallTime(callback) {
    storage.get('install_time', function (result) {
        log("time installed: " + String(Date(result)), STORE_LOG);
        callback(new Date(result['install_time']));
    });
}

function persistSite(url, properties) {
    var urlKey = "$" + url;
    var item = {};
    item[urlKey] = properties;
    storage.set(item, function () {
        log("persisted - " + url + " - " + properties.limit + " - " +
            properties.usedSoFar + " - " + properties.limitEnabled, STORE_LOG);
    });
}

function retrieveSite(url, callback) {
    var urlKey = "$" + url;
    storage.get(urlKey, function (result) {
        if (!chrome.runtime.lastError && result[urlKey] != undefined) {
            log("retrieved - " + url + " - " + result[urlKey].limit + " - " +
                result[urlKey].usedSoFar + " - " + result[urlKey].limitEnabled, STORE_LOG);
            callback(new SiteProperties(result[urlKey]));
        }
    });
}

function persist(key, value) {
    var item = {};
    item[key] = value;
    storage.set(item, function () {
        log("stored " + value, STORE_LOG);
    });
}

function retrieve(key) {
    storage.get(key, function (result) {
        log("retrieved " + result[key], STORE_LOG);
    });
}

function retrieveAll(callback) {
    storage.get(null, function (result) {
        log("retrieved all", STORE_LOG);
        callback(result);
    });
}

// var a = performance.now();
// persist("s50","somesite.com");
// retrieve("s50");
// var b = performance.now();
//log('It took ' + (b - a) + ' ms.');

storage.clear();
persistSite("developer.chrome.com",new SiteProperties(10,2,true));
persistSite("translate.google.com",new SiteProperties(11,1,false));
persist("#reset_time",3);