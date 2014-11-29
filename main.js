var geoip_lat;
var geoip_lon;
var geoapi_lat;
var geoapi_lon;

var geoip_start;
var geoip_end;

function pageloadrender_handler(e)
{
	var timing = performance.timing;
	var elem = document.getElementById("pageloadrender_time");

	elem.innerHTML = (timing.domComplete-timing.fetchStart)+" ms";
}

function pagerender_handler()
{
	var timing = performance.timing;
	var elem = document.getElementById("pagerender_time");

	elem.innerHTML = (timing.domComplete-timing.domLoading)+" ms";
}

function pagefetch_handler()
{
	var timing = performance.timing;
	var elem = document.getElementById("pagefetch_time");

	elem.innerHTML = (timing.responseEnd-timing.fetchStart)+" ms";
}

function readystatechange_handler()
{
	if(document.readyState == "complete")
	{
		pagefetch_handler();
		pagerender_handler();
		pageloadrender_handler();
	}
}

function geoip_time_handler()
{
	var elem = document.getElementById("geoip_time");

	elem.innerHTML = (geoip_end-geoip_start)+" ms";
}

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

function req_geoip()
{
	var xhr = new XMLHttpRequest();

	xhr.open("GET", "http://www.telize.com/geoip", false);

	geoip_start = Date.now();

	xhr.send();

	geoip_end = Date.now();

	geoip_handler(JSON.parse(xhr.responseText));
	geoip_time_handler();
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
	document.addEventListener("readystatechange", readystatechange_handler);

	req_geoip();

	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(geoapi_handler);
	}
	else
	{
		var elem = document.getElementById("geoapi_dep");

		elem.style.display = "none";
	}
}

init();
