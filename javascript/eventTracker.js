var curTabId, curWindowId, browserActive;

chrome.tabs.onUpdated.addListener(tabOnUpdated);
function tabOnUpdated(tabId, changeInfo, tab) {
    var newURL = changeInfo.url;
    if (newURL != null && tabId == curTabId) {
        log("tab updated: - curUrl:" + newURL, EVENT_LOG);
        setBrowserActive(true);
        afterGetURL(newURL);
    }
}

chrome.tabs.onActivated.addListener(tabOnActivated);
function tabOnActivated (activeInfo) {
    log("tab active: - id:" + activeInfo.tabId, EVENT_LOG);
    setBrowserActive(true);
    curTabId = activeInfo.tabId;
    getTabURL(curTabId);
}

chrome.tabs.onRemoved.addListener(tabOnRemoved);
function tabOnRemoved (tabId, windowId) {
    log("tab close: - id:" + tabId, EVENT_LOG);
    setBrowserActive(false);
    curTabId = -1;
    onTerminationEvent();
}

chrome.windows.onFocusChanged.addListener(windowOnFocusChanged);
function windowOnFocusChanged (windowId) {
    if (windowId != -1) {
        log("window focused: - id:" + windowId, EVENT_LOG);
        setBrowserActive(true);
        curWindowId = windowId;
        updateCurTabId();
    }
}

chrome.windows.onRemoved.addListener(windowOnRemoved);
function windowOnRemoved(windowId) {
    log("window closed - id:" + windowId, EVENT_LOG);
    curWindowId = -1;
    setBrowserActive(false);
}

window.setInterval(checkBrowserActive, 1000);
function checkBrowserActive(){
    try {
        chrome.windows.getCurrent(function (window) {
            if (!chrome.runtime.lastError && !popupOpen) {
                setBrowserActive(window.focused);
            }
        })
    }
    catch (err) {
        setBrowserActive(false);
    }
}

function setBrowserActive(active) {
    if (browserActive != active && !active) {
        log("suddenly inactive", EVENT_LOG);
        onTerminationEvent();
        browserActive = false;
        curTabId = -1;
        curWindowId = -1;
    }
    else if (browserActive != active && active) {
        log("suddenly active", EVENT_LOG);
        updateCurTabId();
        browserActive = true;
    }
}

// Asynchronous: gets id of active tab and updates curTabId
function updateCurTabId() {
    var queryInfo = {
        active: true,
        currentWindow: true
    };
    chrome.tabs.query(queryInfo, function (tabs) {
        var currTab = tabs[0];
        if (currTab != null) {
            curTabId = currTab.id;
            getTabURL(curTabId);
        }
    });
}

// Asynchronous: gets curUrl by tabId
function getTabURL(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        if (!chrome.runtime.lastError && tab != null && browserActive) {
            afterGetURL(tab.url);
        }
    })
}
