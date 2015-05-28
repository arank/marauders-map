//Created by Aran Khanna All Rights Reserved
	
// Global Variables

// Map Variables
	L.mapbox.accessToken = 'pk.eyJ1IjoiYXJhbmtoYW5uYSIsImEiOiJjYWYxOTcwYTI4ZTNhNDA5NTdlMzFjMDQ0NWM3OThjMSJ9.j6OVr_W3jAAdxusZ5qLXlg';
	var map_id = "arankhanna.m3ankjj3";
	// Map object
	var map = null;
	// Lines between points drawn on map
	var polyline = null;

// Facebooks message data endpoint
	var endpoint_url = "https://www.facebook.com/ajax/mercury/thread_info.php";

// User Data Structures
	// Dictionary of FB users and their location data
	var user_dict = {};
	// List of names of users loaded (for lookahead search) with corresponding list of FB ids
	var user_list = ['Most Recent'];
	var id_list = [0];

// User Data Variables
	// The most recent data point over all users
	var most_recent_time = 0;
	// Counters for the number of users and data points loaded
	var users_loaded = 0;
	var coords_loaded = 0;
	// User to focus in on
	var focus_user = null;
	// Counter for total number of async rest calls made
	var async_reqs = 0;

// The Logic
	// On every request from the background script get the rest messages
	chrome.runtime.onMessage.addListener(
	  	function(request, sender, sendResponse) {
			getRestMessages(request.bodyText, function() {
				sendResponse();
			});
	  	}
	);

	// When the document is pull cached big pipe data out of it and add the map html
	$( document ).ready(function() {
		// Pull cached big-piped data (not async loaded and most recent)
		getPipeMessages(document.URL, function() {});

		// Set up map
		setupMap(document);
		setupMapControls(document);

		//Check for URL change (react simply diffs and rerenders page so we want to remove map overlay if the URL changes)
		var storedHash = document.URL;
		window.setInterval(function () {
		    if (document.URL != storedHash) {
		        storedHash = document.URL;
		        if(storedHash.indexOf('facebook.com/messages') > -1){
		        	$('#map-tab').css("display", "inline");
		        }else{
		        	$('#map-tab').css("display", "none");
		        }
		    }
		}, 100);
	});

	// Gets and parses json data on user location from posting to FB messages endpoint
	// with the requestBody, calling the callback after its done
	function getRestMessages(requestBody, callback) {
		async_reqs++;
    	console.log("requesting "+async_reqs);
    	$.ajax({
	        type:"POST",
	        url: endpoint_url,
	        data: requestBody,
	        processData: false,
	        complete: function(msg) {
	        	// Convert wierd json format to regular json string
	        	var cleanedText = ""
	        	var splitText = msg.responseText.split(';');
	        	for(var i=3; i<splitText.length; i++){
	        		var cleanedText = cleanedText+splitText[i];
	        	}

	        	// Parse json string and extract location info for each message
	        	var json = jQuery.parseJSON(cleanedText);
	        	var messages = json.payload.actions;
	        	if(messages != undefined){
	        		console.log(messages);
		        	for(var i =0; i<messages.length; i++){
		        		if(messages[i]['coordinates'] != null){
			        		var data = {
			        			"latitude": messages[i]['coordinates']['latitude'],
			        			"longitude": messages[i]['coordinates']['longitude'],
			        			"time": messages[i]['timestamp'],
			        			"user": messages[i]['author'].split(':')[1]
			        		}
		        			console.log(data);
		        			addLayer(data);
		        		}
		        	}
		        }else{
		        	console.log("No messages returned: "+msg.responseText);
		        }
	        	callback();
	        }
		});
	}

	// Gets and parses and data delivered in the html body via BigPipe
	// calling the callback after its done adding the data to the map.
	function getPipeMessages(url, callback) {
		console.log("parsing HTML");
		$.ajax({
			type: "GET",
			url: url,
			complete: function(msg) {
				var regexp = /{"message_id"/g;
				var match;
				while ((match = regexp.exec(msg.responseText)) != null) {
					// console.log("matched");
					var braceCount=1;
					var i;
					for(i=match.index+1; braceCount>0; i++){
						if(msg.responseText[i]=='{'){
							braceCount++;
						}
						else if(msg.responseText[i]=='}'){
							braceCount--;
						}
					}
					var cache_message = jQuery.parseJSON(msg.responseText.substring(match.index, i));
					// console.log(cache_message);	
					if(cache_message['coordinates'] != null){
		        		var data = {
		        			"latitude": cache_message['coordinates']['latitude'],
		        			"longitude": cache_message['coordinates']['longitude'],
		        			"time": cache_message['timestamp'],
		        			"user": cache_message['author'].split(':')[1]
		        		}
		    			console.log(data);
		    			addLayer(data);
		    		}
				}
				callback();
			}
		});
	}

	// Adds the map div and map to the document, along with interactability
	function setupMap(document) {
		// Create tab for map
		var mapTab = document.createElement('div');
		mapTab.id = 'map-tab';
		$('body').append(mapTab);
		$('#map-tab').addClass("map-label");
		$('#map-tab').text('Marauders Map');	

		// Create map for DOM
		var mapDiv = document.createElement('div');
		mapDiv.id = 'map';
    	$('#map-tab').append(mapDiv);

    	// Set up click hierarchy for map tab and add expand retract functionality
	    $("#map-tab div").click(function(e) {
	        e.stopPropagation();
	   	});
		$('#map-tab').on("click", function() {
			if($(this).hasClass("map-expand")){
				$(this).removeClass("map-expand").addClass("map-label");
				$('#map').css("visibility", "visible");
			}else{
				$(this).removeClass("map-label").addClass("map-expand");
				$('#map').css("visibility", "hidden");
			}
		});

		// Set scene to default home
		map = L.mapbox.map('map', map_id)
		 .setView([42.381982, -71.124694], 3);

		// Set to default layer (no user zoom)
		for(var key in user_dict){
			user_dict[key]["last_layer"].addTo(map);
		}
		updateAllOpacities();
	}

	// Adds the control panel for the map to the document, including search bar 
	// back button and counters
	function setupMapControls(document) {
		// Create icon container
    	var containerDiv = document.createElement('div');
		containerDiv.id = 'button-container';
		$('#map').append(containerDiv);

		// Create search bar
		var searchDiv = document.createElement('div');
		searchDiv.id ="search-holder";
		$('#button-container').append(searchDiv);
		var searchBar =  document.createElement('input');
		searchBar.setAttribute("class", "typeahead");
		searchBar.setAttribute("type", "text");
		searchBar.setAttribute("placeholder", "Search Friends");
		$('#search-holder').append(searchBar);		

    	// Create button to change layers
		var backButton = document.createElement('a');
        backButton.href = '#';
        backButton.id = 'back-button';
        backButton.innerHTML = "Back";
        $('#button-container').append(backButton);

        // Create counter and update it to most recent
		var counterDiv = document.createElement('div');
		counterDiv.id = 'counter';
		$('#button-container').append(counterDiv);
		$('#counter').text('Users: 0 Points: 0');
		updateCounters();

		// Attach handler to search bar to autocomplete and focus on user
		$('.typeahead').bind("enterKey",function(e) {
		   if(map != null && focus_user==null){
				var name = $(this).val();
				var index = user_list.indexOf(name);
				if(index != -1){
					var latlng = user_dict[id_list[index]]["last_latlng"];
					map.setView([latlng.lat, latlng.lng], 20);
				}
			}
		});
		$('.typeahead').keyup(function(e) {
		    if(e.keyCode == 13)
		    {
		        $(this).trigger("enterKey");
		    }
		});

		// Attach handler to back button to clear user zoom
		$('#back-button').on("click", function() {
			clearUser();
		});
	}

	// Updates all the opacities for the coordinates points if we are focused in 
	// on a specific user's location history
	function updateFocusOpacity() {
		var min = Number.MAX_VALUE;
		var max = 0;
		if(focus_user != null){
			for(var i=0; i<user_dict[focus_user]["layers"].length; i++){
				if(user_dict[focus_user]["layers"][i]["time"] > max){
					max = user_dict[focus_user]["layers"][i]["time"];
				}
				if(user_dict[focus_user]["layers"][i]["time"] < min){
					min = user_dict[focus_user]["layers"][i]["time"];
				}
			}

			for(var i=0; i<user_dict[focus_user]["layers"].length; i++){
				// Opacity is set to % of total range with 0.3 as floor
				var calcOpacity = (((user_dict[focus_user]["layers"][i]["time"] - min)/(max - min))*0.7) + 0.3;
				$('.'+focus_user+'-'+user_dict[focus_user]["layers"][i]["time"]).css({opacity: calcOpacity});
			}
		}
	}
	
	// Updates all the opacities for the coordinate points if we are not focused on a user
	function updateAllOpacities() {
		var min = Number.MAX_VALUE;
		var max = 0;
		if(focus_user == null){
			// Calculate min and max (for 1 element min=max)
			for(var key in user_dict){
				if(user_dict[key]["last_time"] > max){
					max = user_dict[key]["last_time"]
				}
				if(user_dict[key]["last_time"] < min){
					min = user_dict[key]["last_time"]
				}
			}

			for(var key in user_dict){
				if(max != min){
					// Opacity is set to % of total range with 0.3 as floor
					var calcOpacity = (((user_dict[key]["last_time"] - min)/(max - min))*0.7) + 0.3;
					$('.'+key+'-'+user_dict[key]["last_time"]).css({opacity: calcOpacity});
				}
			}
		}
	}

	// Updates counters with most recent counts of users and coordinates loaded
	function updateCounters() {
		$('#counter').text('Users: '+users_loaded+' Points: '+coords_loaded);
	}

	// Updates typeahead for search box with the most recent list of users
	function updateTypeahead(){
		var substringMatcher = function(strs) {
		  return function findMatches(q, cb) {
		    var matches, substringRegex;
		 
		    // an array that will be populated with substring matches
		    matches = [];
		 
		    // regex used to determine if a string contains the substring `q`
		    substrRegex = new RegExp(q, 'i');
		 
		    // iterate through the pool of strings and for any string that
		    // contains the substring `q`, add it to the `matches` array
		    $.each(strs, function(i, str) {
		      if(substrRegex.test(str)){
		        matches.push(str);
		      }
		    });
		 
		    cb(matches);
		  };
		};

		// remove the old search box and add the new one
		var searchBox = $('#search-holder .typeahead');
		searchBox.typeahead('destroy');
		searchBox.typeahead({
		  hint: true,
		  highlight: true,
		  minLength: 1
		},
		{
		  name: 'states',
		  source: substringMatcher(user_list)
		});
	}

	// Un-focus on a user and go back to the default map of most recent positions for
	// all users
	function clearUser() {
		if(focus_user != null){
			// Layout changes
			$('#search-holder').css("display", "inline");
			$('#back-button').css("display", "none");
			$('#counter').css("display", "inline");

			// Remove zoomed layers
			map.removeLayer(polyline);
		 	polyline = null;
			for(var i=0; i<user_dict[focus_user]["layers"].length; i++){
				map.removeLayer(user_dict[focus_user]["layers"][i]["layer"]);	
			}
			focus_user = null;

			// Set to default layer (no-zoom)
			for(var key in user_dict){
				user_dict[key]["last_layer"].addTo(map);
			}
			updateAllOpacities();
		}
	}

	// Focus on a specific user and display just their search history on the map
	function focusUser(userId) {
		if(focus_user == null){
			focus_user =  userId;

			// Layout changes
			$('#search-holder').css("display", "none");
			$('#back-button').css("display", "inline");
			$('#counter').css("display", "none");


			for(var key in user_dict){
				map.removeLayer(user_dict[key]["last_layer"]);
			}

			var line = [];
			var polyline_options = {
				color: '#3B5998'
			};
			var sorted = user_dict[userId]["layers"].sort(function(a,b) {return a['time'] - b['time']});
			for(var i=0; i<sorted.length; i++){
				user_dict[userId]["layers"][i]["layer"].addTo(map);
				line.push(user_dict[userId]["layers"][i]["latlng"]);
			}
			polyline = L.polyline(line, polyline_options).addTo(map);

			updateFocusOpacity();
		}
	}

	// Add the user to list of all users
	function registerUser(rawUserJson, data) {
		var userInfo = jQuery.parseJSON(rawUserJson);
		var name = userInfo["first_name"] +" "+ userInfo["last_name"];
		if(user_list.indexOf(name) == -1){
			user_list.push(name);
			id_list.push(data.user);
		}
		if(data.time > most_recent_time){
			most_recent_time = data.time;
			id_list[0] =  data.user;
		}
		return name;
	}

	// Creates a new map layer for a user's location
	function createUserLayer(name, data) {
		var date =  new Date(data.time);
		var layer = L.mapbox.featureLayer();
		var geoJSON = {
		    type: 'Feature',
		    geometry: {
		        type: 'Point',
		        // coordinates here are in longitude, latitude order
		        coordinates: [
		          data.longitude,
		          data.latitude 
		        ]
		    },
		    properties: {
		        title: name,
		        description: 'Recorded at: '+date.toGMTString(),
		        icon: {
		        	className: "dot "+data.user+"-"+data.time,
		        	iconUrl: "https://graph.facebook.com/"+data.user+"/picture?type=square",
		        	iconSize: [20, 20],
		        	iconAnchor: [10,10],
		        	popupAnchor:[0,-10]
		        }
		    }
		}

		// Set pictures as icons
		layer.on('layeradd', function(e) {
		    var marker = e.layer,
		        feature = marker.feature;
		    marker.setIcon(L.icon(feature.properties.icon));
		});

		// Transition to zoom in on user
		layer.on('click', function(e) {
			if(focus_user == null){
				focusUser(data.user);
			}
		});

		// Add layer's Json
		layer.setGeoJSON(geoJSON);
		return layer;
	}

	// Adds a layer to the map
	function addUserLayer(layer, data) {
		coords_loaded++;
		if(user_dict[data.user] == undefined){
			users_loaded++;
			user_dict[data.user] = {
				last_time: data.time,
				last_layer: layer,
				last_latlng: {
					lat: data.latitude,
					lng: data.longitude
				},
				layers: [{
					layer: layer,
					time: data.time,
					latlng: {
						lat: data.latitude,
						lng: data.longitude
					}
				}]
			}
			// Add to map if not zoomed on user
			if(map != null && focus_user==null){
				layer.addTo(map);
			}
		}else{
			// Add recorded point to user object
			user_dict[data.user]["layers"].push({
				layer: layer,
				time: data.time,
				latlng: {
					lat: data.latitude,
					lng: data.longitude
				}
			});
			// If this is newst point remove curret one and update
			if(data.time > user_dict[data.user]["last_time"]){
				// This layer may already be removed if it is zoomed or null
				if(map != null && focus_user==null){
					map.removeLayer(user_dict[data.user]["last_layer"]);
				}
				user_dict[data.user]["last_latlng"] = 
				{
					lat: data.latitude,
					lng: data.longitude
				};
				user_dict[data.user]["last_time"] = data.time;
				user_dict[data.user]["last_layer"] = layer;
				// Add to map if not zoomed on user
				if(map != null && focus_user==null){
					layer.addTo(map);
				}
			}
		}
	}

	// Updates all the map control UI components
	function updateUI() {
		if(map != null){
			updateAllOpacities();
			if(focus_user==null){
				updateCounters();
				updateTypeahead();
			}
		}
	}
	


	// Getting FB images doesn't work with ghostery or other tracker blockers
	function addLayer(data) {
		// Get the user's data from FB (also ensures existence of picture for user)
		$.ajax({
			type:"GET",
			url: "https://graph.facebook.com/"+data.user,
			complete: function(msg) {
				var name = registerUser(msg.responseText, data);
				var layer = createUserLayer(name, data);
				addUserLayer(layer, data);
				updateUI();
			}
		});
	}


