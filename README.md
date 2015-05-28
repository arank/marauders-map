# The Marauders Map

ATTENTION: DUE TO THE OVERWHELMING RESPONSE TO THIS EXTENSION AND ITS CORRESPONDING BLOG POST MAPBOX HAS DEACTIVATED THE API KEY IN THIS REPO. TO MAKE IT FUNCTIONAL AGAIN YOU MUST GO INTO src/fb/content.js AND CHANGE L.mapbox.accessToken 
AND map_id TO BE YOUR OWN WHICH CAN BE GENERATED FOR FREE AFTER MAKING AN ACCOUNT AT mapbox.com

I HAVE ALSO BEEN TOLD FACEBOOK IS WORKING TO FIX THE ISSUE SO DON'T EXPECT THIS CODE TO BE FUNCTIONAL FOR LONG :)

## How do I install this?
You can get this extension on the Chrome webstore here: https://chrome.google.com/webstore/detail/marauders-map/mliofombcghaamgjkmmmmlepkiacdhkh

To run this extension from source in your browser simply download it as a zip file and unzip it somewhere on your computer. Go to chrome://extensions, ensure that Developer Mode is enabled and click "Load unpacked extension...". 
Navigate to the root folder (which contains manifest.json) and select it. 
For a sligtly more detailed walkthrough look here: https://www.mattcutts.com/blog/how-to-install-a-chrome-extension-from-github/

## Where did this come from?
This chrome extension was written to accompany my Medium post (which can be viewed here https://medium.com/@arankhanna/9da8820bd27d) about the creepy potential of the 
loaction data we often inadvertantly reveal about ourselves on Facebook messenger, due to its defaults of always sharing your 
location when sending messages from the increasingly popular mobile app. 

## What does this do?
This code scrapes every Facebook message sent by your friends or you with a location attached and then plots those locations chronologically on a map which can be viewed at https://www.facebook.com/messages/

This is not meant to be used as a tool to creep on your friends, rather a demonstration of the scary amount of information you can gather on someone just by aggregating the data they provide through messenger. Hence I made no attempts to facilitate the data generation process, and I ensured that all gathered data disappears on page reload.

You can review the source code here to see how it works. Most of the action happens in src/bg which has the background javascript file for the extension and src/fb which has the content script which runs on the facebook messages page. 
You can see that none of the data scraped by this extension ever leaves your local browser.
