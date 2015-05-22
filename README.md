# The Marauders Map

## How do I install this?
To run this extension in your browser from source simply download it as a zip file and unzip it somewhere on your computer.
Go to chrome://extensions, ensure that Developer Mode is enabled and click load unpacked extension. 
Naviagte to the root folder (which contains manifest.json) and select it. 
For a sligtly more detailed walkthrough look here: https://www.mattcutts.com/blog/how-to-install-a-chrome-extension-from-github/

## Where did this come from?
This chrome extension was written to accompany my Medium post (which can be viewed here ) about the creepy potential of the 
loaction data we often inadvertantly reveal about ourselves on Facebook messanger, due to its defaults of always sharing your 
location when sending messages from the increasingly popular mobile app. 

## What does this do?
This code scrapes every Facebook message sent by your friends or you with a location attached and then plots those locations cronologically on a map which can be viewed at https://www.facebook.com/messages/

This is not meant to be used as a tool to creep on your friends, rather a demonstration of the scary amount of information you can gather on someone just by aggregating the data they provide through messanger. Hence I made no attempts to facilitate the data generation process, and I ensured that all gathered data disappears on page reload.

You can review the source code here to see how it works. Most of the action happens in src/bg which has the background javascript file for the extension and src/fb which has the content script which runs on the facebook messages page. 
You can see that none of the data scraped by this extension ever leaves your local browser.
