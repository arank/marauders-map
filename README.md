# The Marauders Map
AT FACEBOOK'S REQUEST I HAVE DEACTIVATED THE *OFFICIAL* VERSION OF THE APP (CAUSING THE MAP TO NOT DISPLAY). FURTHERMORE, FACEBOOK HAS DEACTIVATED LOCATION SHARING FROM THEIR DESKTOP WEBSITE SO THIS CODE WILL NOT WORK. THEY HAVE ALSO UPDATED THEIR APP TO REMOVE LOCATION SHARING BY DEFAULT, HOWEVER THE MOBILE APP STILL SHARES HISTORICAL LOCATION DATA.

## How do I install this?
You can get this extension on the Chrome webstore here: https://chrome.google.com/webstore/detail/marauders-map/mliofombcghaamgjkmmmmlepkiacdhkh

To install this extension from source simply download it as a zip file and unzip it somewhere on your computer. Go to chrome://extensions, ensure that Developer Mode is enabled and click "Load unpacked extension...". 
Navigate to the root folder (which contains manifest.json) and select it. 
For a sligtly more detailed walkthrough look here: https://www.mattcutts.com/blog/how-to-install-a-chrome-extension-from-github/

## Where did this come from?
This chrome extension was written to accompany my Medium blog post (which can be viewed here https://medium.com/@arankhanna/9da8820bd27d) about the creepy potential of the 
loaction data we often inadvertantly reveal about ourselves on Facebook messenger, due to its defaults of always sharing your 
location when sending messages from the increasingly popular mobile app. 

## What does this do?
This code scrapes every Facebook message sent by your friends or you with a location attached and then plots those locations chronologically on a map which can be viewed at https://www.facebook.com/messages/

This is not meant to be used as a tool to creep on your friends, rather a demonstration of the scary amount of information you can gather on someone just by aggregating the data they provide through messenger. Hence I made no attempts to facilitate the data generation process, and I ensured that all gathered data disappears on page reload.

You can review the source code here to see how it works. Most of the action happens in src/bg which has the background javascript file for the extension and src/fb which has the content script which runs on the facebook messages page. 
You can see that none of the data scraped by this extension ever leaves your local browser.
