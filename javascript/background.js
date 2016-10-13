const CLOSED = 0, ACTIVE_TRACKING = 1, ACTIVE_STANDBY = 2, MIN_ACTIVE_TIME = 2;

var state = CLOSED;
var curURL, startTime, stopTime, timers, curProperties;
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
    timers=null;
    curProperties = null;
}

function clearTimersAndPersistData() {
    if (state == ACTIVE_TRACKING) {
        for (var i = 0; i < curProperties.getLimitPercentages().size; ++i) {
            clearTimeout(timers[i]);
        }
        persistData();
    }
}

function persistData() {
    stopTime = new Date().getTime();
    var activeTime = Math.round((stopTime - startTime) / 1000);

    if (activeTime > MIN_ACTIVE_TIME) {
        log("persisting data: " + curURL + " :+" + activeTime, LOGIC_LOG);
        persistSite(curURL, new SiteProperties(curProperties.getLimit(),
            curProperties.getLimitPercentages().join("_"),
            curProperties.getUsedSoFar() + activeTime, curProperties.getLimitEnabled()));
    }
    else {
        log("only spent " + activeTime + " sec on site", LOGIC_LOG);
    }
}

function newSite(newURL) {
    curURL = newURL;
    log("new site", LOGIC_LOG);
    state = ACTIVE_STANDBY;
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
    for (var i = 0; i < curProperties.getLimitPercentages().length; ++i) {
        var timeTillAlarm =  Math.round(curProperties.getLimit() *
            (curProperties.getLimitPercentages()[i]/100) - curProperties.getUsedSoFar());
        if (timeTillAlarm > 2) {
            timers = setTimeout(alarm, timeTillAlarm * 1000);
            log(curProperties.getLimitPercentages()[i] + "% limit is: " +
                Math.round(curProperties.getLimit() * (curProperties.getLimitPercentages()[i] / 100)) +
                " ,timer in " + timeTillAlarm, LOGIC_LOG);
        }
    }
}

function alarm() {
    log("!ALARM!", LOGIC_LOG);
}


function onPopup(doc) {
    doc.getElementById("input_main_btn").addEventListener("click", function () {
        onMainBtnClick(doc);
    });
    log("popup open");
}


function onMainBtnClick(doc) {
    doc.getElementById("message_text_start").textContent = "hi";
    doc.getElementById("section_message").setAttribute("hidden", "false");
}
