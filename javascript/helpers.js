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

function secondsToText(sec) {
    var minutes = Math.floor((sec / 60) % 60);
    var hours = Math.floor(sec / 3600);
    if (sec == 1) {
        return "1 second";
    }
    else if (sec < 60) {
        return sec + " seconds";
    }
    else if (sec < 120) {
        return "1 minute";
    }
    else if (sec < 3600) {
        return minutes + " minutes";
    }
    else if (sec < 3660) {
        return "1 hour";
    }
    else {
        var minutesText = minutes + ((minutes == 1) ? " minute" : " minutes");
        var hoursText = hours + ((hours == 1) ? " hour" : " hours");
        return hoursText + ", and " + minutesText;
    }
}

// Returns Date object of the next time a usage reset is supposed to happen
function getNextResetDate() {
    var newTime = new Date();
    newTime.setHours(resetHour, 0, 0);
    if (newTime.getTime() < Date.now()) {
        newTime.setDate(newTime.getDate() + 1);
    }
    return newTime;
}

// Returns Date object of the previous time a usage reset should have happened
function getPrevResetDate() {
    var newTime = new Date();
    newTime.setHours(resetHour, 0, 0);
    if (newTime.getTime() > Date.now()) {
        newTime.setDate(newTime.getDate() - 1);
    }
    return newTime;
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

function formatPropertiesForStorage(properties) {
    return new SiteProperties(properties.getLimit(), properties.getLimitPercentages().join("_"),
        properties.getUsedSoFar(), properties.getLimitEnabled());
}

function persistSite(url, properties, callback) {
    var urlKey = url.charAt(0) == "$" ? url : "$" + url;
    var item = {};
    item[urlKey] = typeof properties.limitPercentages == "string" ?
        properties : formatPropertiesForStorage(properties);
    storage.set(item, function () {
        log("persisted - " + url + " - " + properties.limit + " - " +
            properties.limitPercentages + " - " + properties.usedSoFar + " - " +
            properties.limitEnabled, STORE_LOG);
        typeof callback === 'function' && callback();
    });
}

function retrieveSite(url, callback) {
    var urlKey = "$" + url;
    storage.get(urlKey, function (result) {
        if (!chrome.runtime.lastError && result[urlKey] != undefined) {
            log("retrieved - " + url + " - " + result[urlKey].limit + " - " +
                result[urlKey].limitPercentages + " - " + result[urlKey].usedSoFar + " - " +
                result[urlKey].limitEnabled, STORE_LOG);
            callback(new SiteProperties(result[urlKey].limit,
                result[urlKey].limitPercentages.split("_"), result[urlKey].usedSoFar,
                result[urlKey].limitEnabled));
        }
    });
}

function persistSiteDeletion(url, callback) {
    var urlKey = "$" + url;
    storage.remove(urlKey, function () {
        if (chrome.runtime.lastError) {
            log("deletion failed - " + url);
        } else {
            log("deleted - " + url);
            callback();
        }
    });
}

function persist(key, value, callback) {
    var item = {};
    item[key] = value;
    storage.set(item, function () {
        log("stored " + value, STORE_LOG);
        typeof callback === 'function' && callback();
    });
}

function retrieve(key, callback) {
    storage.get(key, function (result) {
        if (!chrome.runtime.lastError && result[key] != undefined) {
            log("retrieved " + result[key], STORE_LOG);
            typeof callback === 'function' && callback(result);
        } else {
            log("Couldn't retrieve key:" + key, STORE_LOG);
        }
    });
}

function retrieveAllSites(callback) {
    storage.get(null, function (result) {
        log("retrieved all", STORE_LOG);
        var allSites = {};
        var keys = Object.keys(result);
        for (var i = 0; i < keys.length; ++i) {
            if (keys[i].charAt(0) == '$') {
                allSites[keys[i]] = result[keys[i]];
            }
        }
        callback(allSites);
    });
}

// Re-persists all site data with all UsedSoFar set to 0
function resetUsage() {
    log("Resetting usage", LOGIC_LOG);
    curProperties.usedSoFar = 0;
    retrieveAllSites(function (allData) {
        var keys = Object.keys(allData);
        for (var i = 0; i < keys.length; ++i) {
            persistSite(keys[i], new SiteProperties(allData[keys[i]].limit,
                allData[keys[i]].limitPercentages, 0, allData[keys[i]].limitEnabled));
        }
    });
    persist("#timeOfLastReset", Date.now());
}

function loadTestData() {
    persistSite("developer.chrome.com", new SiteProperties(12, [50, 75], 1, true));
    persistSite("translate.google.com", new SiteProperties(11, [60], 1, false));
    persist("#resetHour", 0);
    persist("#timeOfLastReset", Date.now());
}

function onStartUp() {
    retrieve("#resetHour", function (resetHourObj) {
        resetHour = 15;
    });
}
onStartUp();

//loadTestData();

// var a = performance.now();
// persist("s50","somesite.com");
// retrieve("s50");
// var b = performance.now();
//log('It took ' + (b - a) + ' ms.');

