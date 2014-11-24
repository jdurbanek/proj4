var geoip_lat;
var geoip_lon;
var geoapi_lat;
var geoapi_lon;

function geoip_handler(json)
{
	var elem = document.getElementById("geoip");

	geoip_lat = json.latitude;
	geoip_lon = json.longitude;

	elem.innerHTML =	"Latitude: "+geoip_lat+"<br>"+
				"Longitude: "+geoip_lon;
}

function geoapi_handler(pos)
{
	var elem = document.getElementById("geoapi");

	geoapi_lat = pos.coords.latitude;
	geoapi_lon = pos.coords.longitude;

	elem.innerHTML =	"Latitude: "+geoapi_lat+"<br>"+
				"Longitude: "+geoapi_lon;

	distance_handler();
}

function distance_handler()
{
	var distance = get_distance(	geoip_lat,
					geoip_lon,
					geoapi_lat,
					geoapi_lon );

	var elem = document.getElementById("distance");

	elem.innerHTML = distance+" km";
}

function get_rad(val)
{
	return val*Math.PI/180;
}

function get_distance(lat1, lon1, lat2, lon2)
{
	var radius = 6371;
	var lat1_rad = get_rad(lat1);
	var lat2_rad = get_rad(lat2);
	var lat_diff = get_rad(lat2-lat1);
	var lon_diff = get_rad(lon2-lon1);

	var a = Math.sin(lat_diff/2)*Math.sin(lat_diff/2)+
		Math.cos(lat1_rad)*Math.cos(lat2_rad)*
		Math.sin(lon_diff/2)*Math.sin(lon_diff/2);

	var c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	return radius*c;
}

function init()
{
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(geoapi_handler);
	}
	else
	{
		var elem = document.getElementById("geoapi_dep");

		elem.style.visibility = "hidden";
	}
}

init();
