// Extention JS For Creepy Message Stalker

console.log("Started...");

var ignored_req = [];

var cc=0;
chrome.webRequest.onBeforeRequest.addListener(
    function(details)
    {
    	var bodyText = String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes));
        for(var i=0; i<ignored_req.length; i++){
        	if(ignored_req[i]==bodyText){
        		return;
        	}
        }
        ignored_req.push(bodyText);
        if(ignored_req.length > 30){
        	ignored_req=[];
        }
        console.log(bodyText);
        // Add timeout to allow content script to load also possible race condition between concurrent requests
        // added randomness to probabalistically compensate (dont wanna build a full locking infrastructure).
        setTimeout(function(){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                cc++;
                console.log("passing request body to content script "+cc);
                chrome.tabs.sendMessage(details.tabId, {bodyText: bodyText}, function(response){
                    console.log("script executed");
                });
            });
        }, Math.random()*10000);
    },
    {urls: ["https://www.facebook.com/ajax/mercury/thread_info.php"]},
    ['requestBody']
);

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
        chrome.tabs.create({url: "./html/help.html"});
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        // chrome.tabs.create({url: "./html/help.html"});
    }
});
