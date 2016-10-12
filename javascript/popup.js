var bgPage = chrome.extension.getBackgroundPage();

function setLabel (name,text) {
    document.getElementById(name).textContent = text;
}

// When popup is opened
document.addEventListener('DOMContentLoaded', function() {
    bgPage.onPopup(document);
});
