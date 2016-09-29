var bgPage = chrome.extension.getBackgroundPage();

function setLabel (name,text) {
    document.getElementById(name).textContent = text;
}

// When popup is opened
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("main_btn").addEventListener("click", function (){
        bgPage.onMainBtnClick();
    });
    bgPage.onPopup();
});
