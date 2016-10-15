function onPopup(doc) {
    popupOpen = true;
    log("popup open");
    clearTimersAndPersistData();
    state = CLOSED_POPUP;
    curURL = null;
    startTime = null;
    stopTime = null;
    timers=null;
    curProperties = null;
    listenToButtons(doc);
}


function showElement(id, doc) {
    doc.getElementById(id).removeAttribute("hidden");
}
function hideElement(id, doc) {
    doc.getElementById(id).setAttribute("hidden","true");
}


function onNA_btnCreate(doc) {
    hideElement("int_NA",doc);
    showElement("int_AInput",doc);
}

function onNAC_btnSave(doc) {
    doc.location.reload();
}

function onNAC_btnCancel(doc) {
    doc.location.reload();
}

function onAD_btnEdit(doc) {
}

function onAD_btnDisable(doc) {
}

function onAD_btnEnable(doc) {
}

function onDO_btnTemp(doc) {
}

function onAD_btnPerm(doc) {
}

function onAD_btnCancel(doc) {
    doc.location.reload();
}


function listenToButtons(doc) {
    doc.getElementById("intNA_btnCreate").addEventListener("click", function () {onNA_btnCreate(doc);});
    doc.getElementById("intNAC_btnSave").addEventListener("click", function () {onNAC_btnSave(doc);});
    doc.getElementById("intNAC_btnCancel").addEventListener("click", function () {onNAC_btnCancel(doc);});
    doc.getElementById("intAD_btnEdit").addEventListener("click", function () {onAD_btnEdit(doc);});
    doc.getElementById("intAD_btnDisable").addEventListener("click", function () {onAD_btnDisable(doc);});
    doc.getElementById("intAD_btnEnable").addEventListener("click", function () {onAD_btnEnable(doc);});
    doc.getElementById("intDO_btnTemp").addEventListener("click", function () {onDO_btnTemp(doc);});
    doc.getElementById("intAD_btnPerm").addEventListener("click", function () {onAD_btnPerm(doc);});
    doc.getElementById("intAD_btnCancel").addEventListener("click", function () {onAD_btnCancel(doc);});
}