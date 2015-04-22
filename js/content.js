

	var user_dict = {};
	var layer_list = [];
	var map = null;

	$( document ).ready(function() {
		var mapDiv = document.createElement('div');
		mapDiv.id = 'map';
    	$('#pagelet_web_messenger').append(mapDiv);
    	L.mapbox.accessToken = 'pk.eyJ1IjoiYXJhbmtoYW5uYSIsImEiOiJEdDJreGxjIn0.Y3-LSV20SRRZOzs_6nSFjA';
		// Set scene to default home
		map = L.mapbox.map('map', 'arankhanna.lnl5mal6')
		 .setView([42.381982, -71.124694], 12);

		for(var key in user_dict){
			user_dict[key]["last_layer"].addTo(map);
		}
	});
	
	function addLayer(data){
		var date =  new Date(data.time);
		var layer = L.mapbox.featureLayer({
		    type: 'Feature',
		    geometry: {
		        type: 'Point',
		        // coordinates here are in longitude, latitude order because
		        coordinates: [
		          data.longitude,
		          data.latitude 
		        ]
		    },
		    properties: {
		        title: data.user,
		        description: 'Recorded at: '+date.toGMTString(),
		        icon: {
		        	className: "dot",
		        	iconUrl: "https://graph.facebook.com/1757391814/picture?type=square",
		        	iconSize: [20, 20],
		        	iconAnchor: [10,10],
		        	popupAnchor:[0,-10]
		        }
		    }
		});

		if(user_dict[data.user] == undefined){
			user_dict[data.user] = {
				last_time: data.time,
				last_layer: layer,
				layers: [layer]
			}
			layer_list.push(layer); 
			if(map != null){
				layer.addTo(map);
			}
		}else{
			user_dict[data.user]["layers"].push(layer);
			if(data.time > user_dict[data.user]["last_time"]){
				map.removeLayer(user_dict[data.user]["last_layer"]);
				user_dict[data.user]["last_time"] = data.time;
				user_dict[data.user]["last_layer"] = layer;
				layer_list.push(layer); 
				if(map != null){
					layer.addTo(map);
				}
			}
		}
	}


	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
    	console.log("requesting");
    	$.ajax({
	        type:"POST",
	        url: "https://www.facebook.com/ajax/mercury/thread_info.php",
	        data: request.bodyText,
	        processData: false,
	        complete: function(msg) {
	        	var json = jQuery.parseJSON(msg.responseText.split(';')[3]);
	        	var messages = json.payload.actions;
	        	// console.log(messages);
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
	        }
		});
	  }
	);


	//   


	