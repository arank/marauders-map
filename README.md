# The Marauders Map
AT FACEBOOK'S REQUEST I HAVE DEACTIVATED THE *OFFICIAL* VERSION OF THE APP. TO GET YOUR OWN UNOFFICAL VERSION RUNNING FOLLOW THESE INTRUCTIONS:
### If you installed the extension from the webstore
1. Go to mapbox.com, create an account (for free) and create a new map
2. Get the public API access token of your mapbox account and the map id of the map you just created
3. Find the code for the installed extension by finding where chrome extensions are installed on your machine (http://stackoverflow.com/questions/14543896/where-does-chrome-store-extensions) and navigating into the folder titled mliofombcghaamgjkmmmmlepkiacdhkh
4. navigate into src/fb/content.js and make L.mapbox.accessToken equal your public API access token, and map_id equal your map id from above
5. the extension should now work as normal ;)

### If you are installing the extension from the source code here
1. Go to mapbox.com, create an account (for free) and create a new map
2. Get the public API access token of your mapbox account and the map id of the map you just created
4. navigate into src/fb/content.js and make L.mapbox.accessToken equal your public API access token, and map_id equal your map id from above
5. the extension should now work as normal ;)

## How do I install this?
You can get this extension on the Chrome webstore here: https://chrome.google.com/webstore/detail/marauders-map/mliofombcghaamgjkmmmmlepkiacdhkh

To install this extension from source simply download it as a zip file and unzip it somewhere on your computer. Go to chrome://extensions, ensure that Developer Mode is enabled and click "Load unpacked extension...". 
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
