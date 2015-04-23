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
            chrome.tabs.sendMessage(details.tabId, {bodyText: bodyText}, function(response){
                console.log("script executed");
            });
		});
    },
    {urls: ["https://www.facebook.com/ajax/mercury/thread_info.php"]},
    ['requestBody']
);