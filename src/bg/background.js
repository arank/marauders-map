//Created by Aran Khanna All Rights Reserved

// Global Variables
    // Facebooks message data endpoint
    var endpoint_url = "https://www.facebook.com/ajax/mercury/thread_info.php";
    // List of async requests already made by page
    var ignored_req = [];
    // Counter for total number of async requests sent to content script
    var async_reqs=0;

// The Logic
    
    // Grabs all outgoing async requests from web pages to the facebook messages endpoint_url
    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            // Get body of request and check that is hasn't been seen before
            var bodyText = String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes));
            if(alreadySent(bodyText)){
                return;
            }
            console.log(bodyText);
            sendRequest(details.tabId, bodyText);
        },
        {urls: [endpoint_url]},
        ['requestBody']
    );

    // Check whether new version is installed and show a help screen
    chrome.runtime.onInstalled.addListener(function(details) {
        if(details.reason == "install"){
            console.log("This is a first install");
            chrome.tabs.create({url: "./html/help.html"});
        }else if(details.reason == "update"){
            var thisVersion = chrome.runtime.getManifest().version;
            console.log("Updated from " + details.previousVersion + " to " + thisVersion);
        }
    });

    // Checks if we have already seen a request with this body
    function alreadySent(bodyText) {
        for(var i=0; i<ignored_req.length; i++){
            if(ignored_req[i]==bodyText){
                return true;
            }
        }
        ignored_req.push(bodyText);
        if(ignored_req.length > 30){
            ignored_req=[];
        }
        return false;
    }

    // Sends command to make async request to the given tab id (which should be a facebook messages tab) 
    function sendRequest(tabId, bodyText) {
        // Add timeout to allow content script to load also possible race condition between concurrent requests
        // added randomness to probabalistically compensate (dont wanna build a full locking infrastructure).
        setTimeout(function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                async_reqs++;
                console.log("passing request body to content script "+async_reqs);
                chrome.tabs.sendMessage(tabId, {bodyText: bodyText}, function(response) {
                    console.log("script executed");
                });
            });
        }, (Math.random()*5000)+2000);
    }
