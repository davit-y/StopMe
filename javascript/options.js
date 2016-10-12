var bgPage = chrome.extension.getBackgroundPage();

function populate_options(allData) {
    var keys = Object.keys(allData);
    var tbl = document.getElementById("data_table");
    for (var i = 0; i < keys.length; ++i) {
        if (keys[i].charAt(0) == '$') {
            addRow(tbl, keys[i], allData[keys[i]]);
        }
    }
}

function addRow(tbl, key, value) {
    tbl.innerHTML = tbl.innerHTML +
        "<tr>" +
        "<td>" + key.substr(1) + "</td>" +
        "<td>" + value.usedSoFar + "</td>" +
        "<td>" + value.limit + "</td>" +
        "<td>" + value.limitEnabled + "</td>" +
        "</tr>";
}

document.addEventListener('DOMContentLoaded', bgPage.retrieveAll(populate_options));