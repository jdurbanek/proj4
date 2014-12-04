var geoip_lat;
var geoip_lon;
var geoapi_lat;
var geoapi_lon;
var geoip_start;
var geoip_end;
var geoapi_start;
var geoapi_end;
var w_ip_s;
var w_api_s;
var w_ip_e;
var w_api_e;
var bus_ip_start;
var bus_ip_end;
var bus_api_start;
var bus_ip_end;
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

	elem.innerHTML = (geoip_end-geoip_start)+" ms IP";
}

function geoapi_time_handler()
{
	var elem = document.getElementById("geoapi_time");

	elem.innerHTML = (geoapi_end-geoapi_start)+" ms API";
}

function weather_ip_time_handler()
{
	var elem = document.getElementById("weather_ip_time");

	elem.innerHTML = (w_ip_e-w_ip_s)+" ms IP";
}

function weather_api_time_handler()
{
	var elem = document.getElementById("weather_api_time");

	elem.innerHTML = (w_api_e-w_api_s)+" ms API";
}

function bus_time_handler()
{
	var elem = document.getElementById("bus_time");

	elem.innerHTML = (bus_ip_end-bus_ip_start)+" ms IP";
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

	geoapi_end = performance.now();
	elem.innerHTML =	"Latitude: "+geoapi_lat+"<br>"+
				"Longitude: "+geoapi_lon;
	geoapi_time_handler();
	get_weather_api();
	getbusinfo(geoapi_lat, geoapi_lon, "geoapi");
	distance_handler();
}

function req_geoip()
{
	var xhr = new XMLHttpRequest();

	xhr.open("GET", "http://www.telize.com/geoip", false);

	geoip_start = performance.now();

	xhr.send();

	geoip_end = performance.now();

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

function weather_ip_handler(json)
{
	var elem = document.getElementById("weather_ip");
	var temp_ip = json.main.temp;
	var humidity_ip = json.main.humidity;
  	
	temp_ip -= 273.15;		

	elem.innerHTML =	"Temperature: "+temp_ip+"C <br>"+
				"Humidity: "+humidity_ip;
}

function get_weather_ip()
{
	var xmlhttp = new XMLHttpRequest();	

	var url =	"http://api.openweathermap.org/data/2.5/weather?lat="+
			geoip_lat+
			"&lon="+
			geoip_lon;

	xmlhttp.open("GET", url, false);
	
	w_ip_s = performance.now();

	xmlhttp.send();

	w_ip_e = performance.now();
	weather_ip_handler(JSON.parse(xmlhttp.responseText));
	weather_ip_time_handler()
}

function weather_handler(json)
{
	var elem = document.getElementById("weather_api");
	var temp_api = json.main.temp;
	var humidity_api = json.main.humidity;
	var lat = json.coord.lat;
	var lon = json.coord.lon;  	

	temp_api -= 273.15;		

	elem.innerHTML =	"Temperature: "+temp_api+"C <br>"+
				"Humidity: "+humidity_api+"<br>"+
				"Lat: "+lat+"<br>"+
				"Lon: "+lon;
}

function get_weather_api()
{
	var xmlhttp = new XMLHttpRequest();	
	var url =	"http://api.openweathermap.org/data/2.5/weather?lat="+
			geoapi_lat+
			"&lon="+
			geoapi_lon;

	xmlhttp.open("GET", url, false);
	w_api_s = performance.now();

	xmlhttp.send();

	w_api_e = performance.now();
	weather_handler(JSON.parse(xmlhttp.responseText));
	weather_api_time_handler();
}

function businfo_handler(json, elem)
{
	elem.innerHTML = "Nearby bus stops:<br>";

	for(var i = 0; i < json.stop.length; i++)
	{
		elem.innerHTML += json.stop[i].stopID+" "+json.stop[i].intersection+"<br>";
	}
}

function businfo_geoip_handler(json)
{
	bus_ip_end = performance.now();
	businfo_handler(json, document.getElementById("businfo_ip"));
}

function businfo_geoapi_handler(json)
{
	bus_api_end = performance.now();
	businfo_handler(json, document.getElementById("businfo_api"));
}

function getbusinfo(lat, lon, loctype)
{
	var script = document.createElement("script");

	script.type = "text/javascript";
	
	script.src =	"http://api.smsmybus.com/v1/getnearbystops"+
			"?key=uwcompsci"+
			"&lat="+lat+
			"&lon="+lon+
			"&callback="+
			((loctype == "geoip")
			?"businfo_geoip_handler"
			:"businfo_geoapi_handler");

	document.getElementsByTagName("head")[0].appendChild(script);
}

function init()
{
	document.addEventListener("readystatechange", readystatechange_handler);

	req_geoip();
	get_weather_ip();
	bus_ip_start = performance.now();
	getbusinfo(geoip_lat, geoip_lon, "geoip");
	
	if(navigator.geolocation)
	{
		geoapi_start = performance.now();
		navigator.geolocation.getCurrentPosition(geoapi_handler);
	}
	else
	{
		var elem = document.getElementById("loc_geoapi");

		elem.style.display = "none";

		elem = document.getElementById("locinfo_geoapi");

		elem.style.display = "none";
	}
	bus_time_handler();
}

init();
