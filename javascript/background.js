const CLOSED = 0, ACTIVE_TRACKING = 1, ACTIVE_STANDBY = 2, CLOSED_POPUP = 3, MIN_ACTIVE_TIME = 2;

var state = CLOSED, popupOpen = false, timers = [];
var curURL, startTime, stopTime, curProperties;
var storage = chrome.storage.local;


//SiteProperties Definition
function SiteProperties(limit, limitPercentages, usedSoFar, limitEnabled) {
    this.limit = limit || 0;
    this.limitPercentages = limitPercentages || [];
    this.usedSoFar = usedSoFar || 0;
    this.limitEnabled = limitEnabled || false;
}
SiteProperties.prototype.getLimit = function () {
    return this.limit;
};
SiteProperties.prototype.getLimitPercentages = function () {
    return this.limitPercentages;
};
SiteProperties.prototype.getUsedSoFar = function () {
    return this.usedSoFar;
};
SiteProperties.prototype.getLimitEnabled = function () {
    return this.limitEnabled;
};


function afterGetURL(newURL) {
    var newCleanURL = cleanURL(newURL);
    log("old: " + curURL + " new: " + newCleanURL, LOGIC_LOG);
    if (curURL != newCleanURL) {
        onUpdateEvent(newCleanURL);
    }
}

function onUpdateEvent(newURL) {
    clearTimersAndPersistData();
    newSite(newURL);
}

function onTerminationEvent() {
    clearTimersAndPersistData();
    state = CLOSED;
    curURL = null;
    startTime = null;
    stopTime = null;
    timers = [];
    curProperties = null;
}

function clearTimersAndPersistData() {
    if (state == ACTIVE_TRACKING) {
        while (timers.length >= 1) {
            clearTimeout(timers.pop());
        }
        persistData();
    }
}

function persistData() {
    stopTime = new Date().getTime();
    var activeTime = Math.round((stopTime - startTime) / 1000);

    if (activeTime > MIN_ACTIVE_TIME) {
        log("persisting data: " + curURL + " :+" + activeTime, LOGIC_LOG);
        curProperties.usedSoFar = curProperties.getUsedSoFar() + activeTime;
        persistSite(curURL, curProperties);
    }
    else {
        log("only spent " + activeTime + " sec on site", LOGIC_LOG);
    }
}

function newSite(newURL) {
    curURL = newURL;
    log("new site", LOGIC_LOG);
    state = ACTIVE_STANDBY;
    popupOpen = false;
    startTime = new Date().getTime();
    retrieveSite(curURL, afterGetProperties);
}

function afterGetProperties(properties) {
    state = ACTIVE_TRACKING;
    curProperties = properties;
    if (curProperties.getLimitEnabled()) {
        updateAlarmTime();
    }
}

function updateAlarmTime() {
    var timeTillAlarm = Math.round(curProperties.getLimit() - curProperties.getUsedSoFar());
    if (timeTillAlarm > 2) {
        timers.push(setTimeout(alarm, timeTillAlarm * 1000));
        log("alarm limit is: " + curProperties.getLimit() + " ,timer in " + timeTillAlarm, LOGIC_LOG);
    }
    curProperties.getLimitPercentages().forEach(function (percent) {
        var timeTillPercentageAlarm = Math.round(curProperties.getLimit() *
            (percent / 100) - curProperties.getUsedSoFar());
        if (timeTillPercentageAlarm > 2) {
            timers.push(setTimeout(alarm, timeTillPercentageAlarm * 1000));
            log(percent + "% limit is: " + Math.round(curProperties.getLimit() *
                    (percent / 100)) + " ,timer in " + timeTillPercentageAlarm, LOGIC_LOG);
        }
    });
}

function alarm() {
    log("!ALARM!");
}
