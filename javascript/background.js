var state, url, startTime, stopTime, alarmTime;
var storage = chrome.storage.local;

const ACTIVE = 0, CLOSED = 1;


//Site Definition
function Site (address, properties) {
    this.address = address;
    this.properties = properties;
}
Site.prototype.getAddres = function () {
    return this.address;
};

Site.prototype.getProperties = function () {
    return this.properties;
};

//SiteProperties Definition
function SiteProperties(limit, usedSoFar, limitEnabled) {
    this.limit = limit || 0;
    this.usedSoFar = usedSoFar || 0;
    this.limitEnabled = limitEnabled || false;
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



function afterGetURL(newUrl) {
    var newCleanUrl = cleanURL(newUrl);
    log("old: " + url + " new: " + newCleanUrl, LOGIC_LOG);
    if (url != newCleanUrl) {
        onUpdateEvent(newCleanUrl);
    }
}

function onUpdateEvent(newUrl) {
    persistData();
    newSite(newUrl);
}

function onTerminationEvent() {
    persistData();
    state = CLOSED;
}

function persistData() {
    log("persisting data", LOGIC_LOG);
    stopTime = new Date().getTime();
}

function newSite(newUrl) {
    url = newUrl;
    log("new site", LOGIC_LOG);
    state = ACTIVE;
    startTime= new Date().getTime();
}





function onPopup () {
}

function onMainBtnClick() {
    
}






