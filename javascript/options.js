var bgPage = chrome.extension.getBackgroundPage();
var resetHourDropdown = document.getElementById("select_time");

function onOpen() {
    populateData();
    bgPage.retrieveAllSites(function (result) {
        if(Object.keys(result).length == 0) {
            hideElement("msg_with_alarms");
            hideElement("alarm_options");
            showElement("msg_no_alarms");
            showElement("no_alarm_options");
        } else {
            showElement("msg_with_alarms");
            showElement("alarm_options");
            hideElement("msg_no_alarms");
            hideElement("no_alarm_options");
        }
    });
}

function populateData() {
    bgPage.retrieveAllSites(repopulateTable);
    bgPage.retrieve("#resetHour",repopulateResetHour);
}

function repopulateTable(siteData) {
    var newTBody = document.createElement("tbody");
    var keys = Object.keys(siteData);
    for (var i = 0; i < keys.length; ++i) {
        addRow(newTBody, keys[i], siteData[keys[i]]);
    }
    var oldTBody = document.getElementById("table_body");
    oldTBody.parentNode.replaceChild(newTBody, oldTBody);
    newTBody.setAttribute("id","table_body");
}

function repopulateResetHour(hourObject) {
    resetHourDropdown.value = hourObject["#resetHour"];
}

function addRow(tbody, key, value) {
    tbody.innerHTML = tbody.innerHTML +
        "<tr>" +
        "<td>" + key.substr(1) + "</td>" +
        "<td>" + bgPage.secondsToText(value.usedSoFar) + "</td>" +
        "<td>" + bgPage.secondsToText(value.limit) + "</td>" +
        "<td>" + (value.limitEnabled ? 'Enabled' : "Disabled") + "</td>" +
        "</tr>";
}

function onEnableAll() {
    bgPage.switchAllAlarms(true,function () {
        bgPage.retrieveAllSites(repopulateTable);
    });
}

function onDisableAll() {
    bgPage.switchAllAlarms(false,function () {
        bgPage.retrieveAllSites(repopulateTable);
    });
}

function onResetHourSelection() {
    bgPage.persist("#resetHour",parseInt(resetHourDropdown.value));
}

document.addEventListener('DOMContentLoaded', onOpen);
document.getElementById("enable_all").addEventListener("click", onEnableAll);
document.getElementById("disable_all").addEventListener("click", onDisableAll);
resetHourDropdown.addEventListener("change", onResetHourSelection);