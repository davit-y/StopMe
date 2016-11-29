var bgPage = chrome.extension.getBackgroundPage();
var pageURL, pageProperties, startTime, inputLimit, inputPercentages;
const defaultLimit = 1800, defaultPercentages = [50, 90];

// Triggered when popup is opened
document.addEventListener('DOMContentLoaded', function () {
    enableDebug();
    pageURL = bgPage.curURL;
    pageProperties = bgPage.curProperties;
    startTime = bgPage.startTime;
    log("popup open");
    log(pageURL);
    log(pageProperties);
    clearBGPageData();
    listenToButtons();
    refresh();
});

// Simulates refreshing the page
function refresh() {
    updatePageProperties();
    hideAllElementsInSections();
    (pageProperties == undefined) ? startWithNoData() : startWithData();
}

// Loads popup content for sites without alarms
function startWithNoData() {
    setLabel("msgNA_url", pageURL);
    showElement("msg_noAlarm");
    showElement("int_NA");
}

// Loads popup content for sites with enabled or disabled alarms
function startWithData() {
    updateUsedSoFar();
    popMsgActive();
    popMsgAlarmDeleted();
    if (pageProperties.getLimitEnabled()) {
        popAlarmDetails();
        showElement("msg_usage");
        showElement("int_ADetails");
    }
    else {
        showElement("msg_usage");
        showElement("int_ADisabled");
    }
}

function updatePageProperties() {
    bgPage.retrieveSite(pageURL, function (result) {
        if (pageProperties == undefined ||
            result.getUsedSoFar() >= pageProperties.getUsedSoFar()) {
            pageProperties = result;
        }
    });
}

function setLabel(name, text) {
    document.getElementById(name).textContent = text;
}

function setInput(name, value) {
    document.getElementById(name).value = value;
}

function setCheckbox(name, value) {
    document.getElementById(name).checked = value;
}

function setInnerHTML(name, value) {
    document.getElementById(name).innerHTML = value;
}

function showElement(id) {
    document.getElementById(id).removeAttribute("hidden");
}
function hideElement(id) {
    document.getElementById(id).setAttribute("hidden", "true");
}

function enableElement(id) {
    document.getElementById(id).removeAttribute("disabled");
}
function disableElement(id) {
    document.getElementById(id).setAttribute("disabled", "true");
}

//populate usage message section with data
function popMsgActive() {
    setLabel("msgU_url", pageURL);
    setLabel("msgU_time", bgPage.secondsToText(pageProperties.getUsedSoFar()));
}

//populate usage message section with data
function popMsgAlarmDeleted() {
    setLabel("msgADel_url", pageURL);
}

//populate alarm details section with data
function popAlarmDetails() {
    setLabel("intAD_limit", bgPage.secondsToText(pageProperties.getLimit()));
    const numOfPercentages = pageProperties.getLimitPercentages().length;
    if (numOfPercentages == 0) {
        hideElement("intAD_percent");
    } else if (numOfPercentages == 1) {
        showElement("intAD_percent");
        setLabel("intAD_percentVals", pageProperties.getLimitPercentages()[0] + "%");
    } else if (numOfPercentages == 2) {
        showElement("intAD_percent");
        setLabel("intAD_percentVals", pageProperties.getLimitPercentages()[0] + "%, and " +
            pageProperties.getLimitPercentages()[1] + "%");
    }
}

function popAlarmInput(limit, percentages) {
    setInput("intAI_limitHr", Math.floor(limit / 3600));
    setInput("intAI_limitMin", Math.floor((limit / 60) % 60));
    if (percentages.length == 0) {
        setCheckbox("intAI_check1", false);
        setCheckbox("intAI_check2", false);
        disableElement("intAI_per1");
        disableElement("intAI_per2");
    }
    else if (percentages.length == 1) {
        setInput("intAI_per1", percentages[0]);
        setCheckbox("intAI_check1", true);
        setCheckbox("intAI_check2", false);
        enableElement("intAI_per1");
        disableElement("intAI_per2");
    }
    else if (percentages.length == 2) {
        setInput("intAI_per1", percentages[0]);
        setInput("intAI_per2", percentages[1]);
        setCheckbox("intAI_check1", true);
        setCheckbox("intAI_check2", true);
        enableElement("intAI_per1");
        enableElement("intAI_per2");
    }
}

// Validates inputted data in Alarm Input Form
function isValidInput() {
    var valid = true, validationMsg = "";
    var seconds = 0, percentages = [];
    const hourMsg = "<br>Please enter a number between 0 and 23 for hours.";
    const minMsg = "<br>Please enter a number between 0 and 59 for minutes.";
    const percent1Msg = "<br>Please enter a number between 1 and 99 for first percentage.";
    const percent2Msg = "<br>Please enter a number between 1 and 99 for second percentage.";
    var hours = document.getElementById("intAI_limitHr").value;
    var minutes = document.getElementById("intAI_limitMin").value;
    var per1 = document.getElementById("intAI_per1").value;
    var per2 = document.getElementById("intAI_per2").value;
    var check1 = document.getElementById("intAI_check1").checked;
    var check2 = document.getElementById("intAI_check2").checked;

    isValidNum(hours, 0, 23) ? seconds += (+hours) * 3600 : validationMsg += hourMsg;
    isValidNum(minutes, 0, 59) ? seconds += (+minutes) * 60 : validationMsg += minMsg;
    if (check1) isValidNum(per1, 1, 99) ? percentages.push(Math.round(+per1)) : validationMsg += percent1Msg;
    if (check2) isValidNum(per2, 1, 99) ? percentages.push(Math.round(+per2)) : validationMsg += percent2Msg;

    if (validationMsg == "") {
        inputLimit = Math.round(seconds);
        inputPercentages = percentages;
    } else {
        valid = false;
        validationMsg = "Invalid Input:" + validationMsg;
        setInnerHTML("intAI_validation", validationMsg);
    }
    return valid;
}

function isValidNum(value, min, max) {
    return (!isNaN(value) && (+value) >= min && (+value) <= max);
}

// Button to create a new alarm
function onNA_btnCreate() {
    popAlarmInput(defaultLimit, defaultPercentages);
    hideElement("int_NA");
    showElement("int_AInput");
}

// Button to save a newly created alarm
function onAI_btnSave() {
    if (isValidInput()) {
        if (pageProperties == undefined) {
            pageProperties = new bgPage.SiteProperties(inputLimit, inputPercentages, 0, true);
        } else {
            pageProperties.limit = inputLimit;
            pageProperties.limitPercentages = inputPercentages;
        }
        bgPage.persistSite(pageURL, pageProperties, function () {
            hideElement("msg_noAlarm");
            hideElement("int_AInput");
            showElement("msg_newAlarm");
        });
    }
}

// Button to cancel creating a new alarm
function onAI_btnCancel() {
    refresh();
}

// Button to edit active alarm
function onAD_btnEdit() {
    popAlarmInput(pageProperties.getLimit(), pageProperties.getLimitPercentages());
    hideElement("int_ADetails");
    showElement("int_AInput");
}

// Button to open disable options for active alarm
function onAD_btnDisable() {
    hideElement("int_ADetails");
    showElement("int_DisableOpt");
}


// Button to enable and edit disabled alarm
function onADis_btnEnable() {
    popAlarmInput(pageProperties.getLimit(), pageProperties.getLimitPercentages());
    hideElement("int_ADisabled");
    showElement("int_AInput");
}

// Button to temporarily disable alarm
function onDO_btnTemp() {
    pageProperties.limitEnabled = false;
    bgPage.persistSite(pageURL, pageProperties, function () {
        refresh();
    });
}

// Button to permanently disable alarm
function onDO_btnPerm() {
    bgPage.persistSiteDeletion(pageURL, function () {
        hideElement("msg_usage");
        hideElement("int_DisableOpt");
        showElement("msg_AlarmDeleted");
        showElement("int_NA");
    });
}

// Button to cancel disabling active alarm
function onDO_btnCancel() {
    refresh();
}

// Checkbox for additional alarms in AInput. Enables/Disables corresponding percentage input
function onPercentCheck(elementNum) {
    document.getElementById("intAI_check" + elementNum).checked ?
        enableElement("intAI_per" + elementNum) : disableElement("intAI_per" + elementNum);
}

// Clears timers, persists data, and nullifies vars in background page
function clearBGPageData() {
    bgPage.popupOpen = true;
    bgPage.clearTimersAndPersistData();
    bgPage.state = bgPage.CLOSED_POPUP;
    bgPage.curURL = null;
    bgPage.startTime = null;
    bgPage.stopTime = null;
    bgPage.timers = [];
    bgPage.curProperties = null;
}

function listenToButtons() {
    document.getElementById("intNA_btnCreate").addEventListener("click", onNA_btnCreate);
    document.getElementById("intAI_btnSave").addEventListener("click", onAI_btnSave);
    document.getElementById("intAI_btnCancel").addEventListener("click", onAI_btnCancel);
    document.getElementById("intAD_btnEdit").addEventListener("click", onAD_btnEdit);
    document.getElementById("intAD_btnDisable").addEventListener("click", onAD_btnDisable);
    document.getElementById("intADis_btnEnable").addEventListener("click", onADis_btnEnable);
    document.getElementById("intDO_btnTemp").addEventListener("click", onDO_btnTemp);
    document.getElementById("intDO_btnPerm").addEventListener("click", onDO_btnPerm);
    document.getElementById("intDO_btnCancel").addEventListener("click", onDO_btnCancel);
    document.getElementById("intAI_check1").addEventListener("change", function () {
        onPercentCheck("1");
    });
    document.getElementById("intAI_check2").addEventListener("change", function () {
        onPercentCheck("2");
    });
}

function hideAllElementsInSections() {
    hideElement("msg_noAlarm");
    hideElement("msg_newAlarm");
    hideElement("msg_usage");
    hideElement("int_NA");
    hideElement("int_AInput");
    hideElement("int_ADetails");
    hideElement("int_ADisabled");
    hideElement("int_DisableOpt");
}

// Updated UsedSoFar for pageProperties manually since data persistence happens after popup opening
function updateUsedSoFar() {
    var stopTime = new Date().getTime();
    var activeTime = Math.round((stopTime - startTime) / 1000);
    if (activeTime > bgPage.MIN_ACTIVE_TIME) {
        pageProperties.usedSoFar = pageProperties.usedSoFar + activeTime;
    }
}

function log(text, type) {
    bgPage.log(text, type);
}

function enableDebug() {
    showElement("debug");
    document.getElementById("debug_refresh").addEventListener("click", function () {
        refresh();
    });
    document.getElementById("debug_misc").addEventListener("click", function () {
        bgPage.resetUsage();
    });
}
