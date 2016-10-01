var state, curURL, startTime, stopTime, alarmTime;
var storage = chrome.storage.local;

const ACTIVE = 0, CLOSED = 1;


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
    persistData();
    newSite(newURL);
}

function onTerminationEvent() {
    persistData();
    state = CLOSED;
}

function persistData() {
    log("persisting data", LOGIC_LOG);
    stopTime = new Date().getTime();
}

function newSite(newURL) {
    curURL = newURL;
    log("new site", LOGIC_LOG);
    state = ACTIVE;
    startTime= new Date().getTime();
    //retrieveSite(curURL,updateAlarmTime);
}

function updateAlarmTime(properties) {
    alarmTime = null;
    if (properties.getLimitEnabled()) {
        log(properties.getLimit(), LOGIC_LOG);
    }
}



function onPopup () {
}

function onMainBtnClick() {
    
}






