	
	L.mapbox.accessToken = 'pk.eyJ1IjoiYXJhbmtoYW5uYSIsImEiOiJEdDJreGxjIn0.Y3-LSV20SRRZOzs_6nSFjA';
	var map = null;

	// List of FB users and their most recent points
	var user_dict = {};
	// List of names of users loaded (for lookahead search) with corresponding list of ids
	var user_list = ['Most Recent'];
	var id_list = [0];
	var most_recent_time = 0;
	// Counters for users and coordinates loaded
	var users_loaded = 0;
	var coords_loaded = 0;
	// User to focus in on
	var focus_user = null;
	// Lines between points drawn
	var polyline = null;

	var cc = 0;
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	cc++;
    	console.log("requesting "+cc);
    	$.ajax({
	        type:"POST",
	        url: "https://www.facebook.com/ajax/mercury/thread_info.php",
	        data: request.bodyText,
	        processData: false,
	        complete: function(msg) {
	        	var json = jQuery.parseJSON(msg.responseText.split(';')[3]);
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
		        	updateOpacities();
		        	updateTypeahead();
		        }else{
		        	console.log("No messages returned: "+msg.responseText);
		        }
	        	sendResponse();
	        }
		});
	  }
	);

	$( document ).ready(function() {
		// Pull cached big-piped data (not async loaded and most recent)
		$.ajax({
			type: "GET",
			url: document.URL,
			complete: function(msg){
				console.log("Parsing HTML");
				// console.log(msg.responseText);
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
				updateOpacities();
				updateTypeahead();
			}
		});

		// TODO add bottom tab to pop out map
		var mapTab = document.createElement('div');
		mapTab.id = 'map-tab';
		$('body').append(mapTab);
		$('#map-tab').text('Marauders Map');

		// TODO add search bar instead of info to map

		// TODO add bootbox tutorial on load CustomDialog

		// Create map for DOM
		var mapDiv = document.createElement('div');
		mapDiv.id = 'map';
    	$('#map-tab').append(mapDiv);

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

        // Create counter
		var counterDiv = document.createElement('div');
		counterDiv.id = 'counter';
		$('#button-container').append(counterDiv);
		$('#counter').text('Users: 0, Points: 0');

		// $('#map-tab').on("click", function(){

		// });

		$('.typeahead').bind("enterKey",function(e){
		   if(map != null && focus_user==null){
				var name = $(this).val();
				var index = user_list.indexOf(name);
				if(index != -1){
					var latlng = user_dict[id_list[index]]["last_latlng"];
					map.setView([latlng.lat, latlng.lng], 20);
				}
			}
		});
		$('.typeahead').keyup(function(e){
		    if(e.keyCode == 13)
		    {
		        $(this).trigger("enterKey");
		    }
		});

		$('#back-button').on("click", function(){
			if(focus_user != null){
				// Layout changes
				$('#search-holder').css("display", "inline");
				$('#back-button').css("display", "none");

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
				updateOpacities();

			}else{
				alert("These are the last recorded positions of your friends reported by FB chat. Click any icon to view that user's location history. Fainter pictures denote data recorded further in the past.");
			}
		});

		// Set scene to default home
		map = L.mapbox.map('map', 'arankhanna.lnl5mal6')
		 .setView([42.381982, -71.124694], 3);

		// Set to default layer (no-zoom)
		for(var key in user_dict){
			user_dict[key]["last_layer"].addTo(map);
		}
		updateOpacities();
	});
	
	function updateOpacities(){
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
		}else{
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

	function updateCounters(){
		$('#counter').text('Users: '+users_loaded+', Points: '+coords_loaded);
	}

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
		      if (substrRegex.test(str)) {
		        matches.push(str);
		      }
		    });
		 
		    cb(matches);
		  };
		};

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

	function focusUser(userId){
		focus_user =  userId;

		// Layout changes
		$('#search-holder').css("display", "none");
		$('#back-button').css("display", "inline");


		for(var key in user_dict){
			map.removeLayer(user_dict[key]["last_layer"]);
		}

		var line = [];
		var polyline_options = {
			color: '#3B5998'
		};
		var sorted = user_dict[userId]["layers"].sort(function(a,b){return a['time'] - b['time']});
		for(var i=0; i<sorted.length; i++){
			user_dict[userId]["layers"][i]["layer"].addTo(map);
			line.push(user_dict[userId]["layers"][i]["latlng"]);
		}
		polyline = L.polyline(line, polyline_options).addTo(map);

		updateOpacities();
	}


	// Getting FB images doesn't work with ghostery or other tracker blockers
	function addLayer(data){
		// Get the user's data from FB (also ensures existence of picture)
		$.ajax({
			type:"GET",
			url: "https://graph.facebook.com/"+data.user,
			complete: function(msg){
				var userInfo = jQuery.parseJSON(msg.responseText);
				var name = userInfo["first_name"] +" "+ userInfo["last_name"];
				if(user_list.indexOf(name) == -1){
					user_list.push(name);
					id_list.push(data.user);
				}
				if(data.time > most_recent_time){
					most_recent_time = data.time;
					id_list[0] =  data.user;
				}
				// Create data point layer
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

				layer.on('layeradd', function(e) {
				    var marker = e.layer,
				        feature = marker.feature;
				    marker.setIcon(L.icon(feature.properties.icon));
				});

				layer.on('click', function(e){
					if(focus_user == null){
						focusUser(data.user);
					}
				});

				layer.setGeoJSON(geoJSON);

				// If user hasn't been recorded set this as their most recent point
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
				updateCounters();
			}
		});
	}


