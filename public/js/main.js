 var days 		= ['domingo','lunes','martes','miécoles','jueves','viernes','sábado'];
var months 		= ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','dicembre'];
var dayAbbr 	= ['dom','lun','mar','mie','jue','vie','sab'];
var today 		= 'hoy';
var tomorrow 	= 'mañana';
var in_days 	= 'días';
var datelabel 	= 'Día';
var morning 	= ['¡Buenos días!','¡Hola Bebés, que tengais un día super cool!','¿Como has dormido princesa?'];
var afternoon 	= ['¡Hola bebé!','You look sexy!','Looking good today!'];
var evening 	= ['Wow, You look hot!','You look nice!','Hi, sexy!'];
var feed		= 'http://meneame.feedsportal.com/rss';
moment.locale('es');

var weatherParams = {
		'q':'Madrid, España',
		'units':'metric',
		'lang':'es'
	};


function updateTime() {
	var now = new Date();
	var day = now.getDay();
	var date = now.getDate();
	var month = now.getMonth();
	var year = now.getFullYear();

	var date = days[day] + ', ' + date+' ' + months[month] + ' ' + year;

	console.log(date);

	var container = $('#topLeftContainer');
	container.empty();

	var div = "<div class='more-left'>"
		+"<div class='date small dimmed'>" + date + "</div>"
		+"<div class='time'>" + now.toTimeString().substring(0,5) + '<span class="sec">'+now.toTimeString().substring(6,8)+'</span>' + "</div>";

	container.html(div);

	setTimeout(function() {
			updateTime();
	}, 1000);

	
};

function updateCurrentWeather() {

	var iconTable = {
		'01d':'wi-day-sunny',
		'02d':'wi-day-cloudy',
		'03d':'wi-cloudy',
		'04d':'wi-cloudy-windy',
		'09d':'wi-showers',
		'10d':'wi-rain',
		'11d':'wi-thunderstorm',
		'13d':'wi-snow',
		'50d':'wi-fog',
		'01n':'wi-night-clear',
		'02n':'wi-night-cloudy',
		'03n':'wi-night-cloudy',
		'04n':'wi-night-cloudy',
		'09n':'wi-night-showers',
		'10n':'wi-night-rain',
		'11n':'wi-night-thunderstorm',
		'13n':'wi-night-snow',
		'50n':'wi-night-alt-cloudy-windy'
	}


	$.getJSON('http://api.openweathermap.org/data/2.5/weather', weatherParams, function(json, textStatus) {

		var temp = roundVal(json.main.temp);
		var temp_min = roundVal(json.main.temp_min);
		var temp_max = roundVal(json.main.temp_max);

		var wind = roundVal(json.wind.speed);

		var iconClass = iconTable[json.weather[0].icon];
		var icon = $('<span/>').addClass('icon').addClass('dimmed').addClass('wi').addClass(iconClass);
		$('.temp').updateWithText(icon.outerHTML()+temp+'&deg;', 1000);

		// var forecast = 'Min: '+temp_min+'&deg;, Max: '+temp_max+'&deg;';
		// $('.forecast').updateWithText(forecast, 1000);

		var now = new Date();
		var sunrise = new Date(json.sys.sunrise*1000).toTimeString().substring(0,5);
		var sunset = new Date(json.sys.sunset*1000).toTimeString().substring(0,5);

		var windString = '<span class="wi wi-strong-wind xdimmed"></span> ' + kmh2beaufort(wind) ;
		var sunString = '<span class="wi wi-sunrise xdimmed"></span> ' + sunrise;
		if (json.sys.sunrise*1000 < now && json.sys.sunset*1000 > now) {
			sunString = '<span class="wi wi-sunset xdimmed"></span> ' + sunset;
		}
		$('.windsun').updateWithText(windString+' '+sunString, 1000);
	});

	setTimeout(function() {
		updateCurrentWeather();
	}, 60000);
};

$( document ).ready(function() {
	updateTime();
	updateCurrentWeather();
	$('#topRightContainer').html("<div class='more-right'>"
		+ "<div class='windsun small dimmed' style='display: block;'><span class='wi wi-strong-wind xdimmed'></span> 1 <span class='wi wi-sunset xdimmed'></span> 21:24</div><div class='temp' style='display: block;'><span class='icon dimmed wi wi-day-sunny'></span>27.9°</div><div class='forecast small dimmed' style='display: block;'></div></div>"
		+ "</div>");
})