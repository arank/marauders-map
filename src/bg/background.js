// Extention JS For Creepy Message Stalker

console.log("Started...");

var ignored_req = []
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
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	console.log("passing request body to content script");
		  	chrome.tabs.sendMessage(tabs[0].id, {bodyText: bodyText}, function(response){});
		});
    },
    {urls: ["https://www.facebook.com/ajax/mercury/thread_info.php"]},
    ['requestBody']
);

// chrome.webRequest.onBeforeSendHeaders.addListener(
//     function(details)
//     {
//         console.log(details);
//         getMessageJson(null, details.requestHeaders);
//     },
//     {urls: ["https://www.facebook.com/ajax/mercury/thread_info.php"]},
//     ['requestHeaders']
// );