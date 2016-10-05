var state, curURL, startTime, stopTime, timeTillAlarm, timer, curProperties;
var storage = chrome.storage.local;

const ACTIVE = 0, CLOSED = 1, MIN_ACTIVE_TIME = 2;


//SiteProperties Definition
function SiteProperties(limit, usedSoFar, limitEnabled) {
    //If Object as only parameter
    if (typeof limit == "object" && usedSoFar == null && limitEnabled == null) {
        this.limit = limit.limit || 0;
        this.usedSoFar = limit.usedSoFar || 0;
        this.limitEnabled = limit.limitEnabled || false;
    }
    else {
        this.limit = limit || 0;
        this.usedSoFar = usedSoFar || 0;
        this.limitEnabled = limitEnabled || false;
    }
}
SiteProperties.prototype.getLimit = function () {
    return this.limit;
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
    clearTimeout(timer);
    persistData();
    newSite(newURL);
}

function onTerminationEvent() {
    clearTimeout(timer);
    persistData();
    state = CLOSED;
    curURL = null;
    startTime = null;
    stopTime = null;
    timeTillAlarm = null;
    curProperties = null;
}

function persistData() {
    stopTime = new Date().getTime();
    var activeTime = Math.round((stopTime - startTime) / 1000);

    if (activeTime > MIN_ACTIVE_TIME && startTime > 0) {
        log("persisting data: " + curURL + " :+" + activeTime, LOGIC_LOG);
        persistSite(curURL, new SiteProperties(curProperties.getLimit(),
            curProperties.getUsedSoFar() + activeTime, curProperties.getLimitEnabled()));
    }
    else {
        log("only spent " + activeTime + " sec on site", LOGIC_LOG);
    }
}

function newSite(newURL) {
    curURL = newURL;
    log("new site", LOGIC_LOG);
    state = ACTIVE;
    startTime= new Date().getTime();
    retrieveSite(curURL,updateAlarmTime);
}

function updateAlarmTime(properties) {
    curProperties = properties;
    timeTillAlarm = null;
    if (curProperties.getLimitEnabled()) {
        timeTillAlarm = curProperties.getLimit() - curProperties.getUsedSoFar();
        timer = setTimeout(alarm, timeTillAlarm * 1000);
        log("limit is: " + curProperties.getLimit() +
            " ,timer in " + timeTillAlarm, LOGIC_LOG);
    }
}

function alarm() {
    log("!ALARM!", LOGIC_LOG);
}


function onPopup () {
}

function onMainBtnClick() {
}
