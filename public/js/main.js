'use strict';

var days 		= ['domingo','lunes','martes','miécoles','jueves','viernes','sábado'];
var months 		= ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','dicembre'];
var dayAbbr 	= ['dom','lun','mar','mie','jue','vie','sab'];
var today 		= 'hoy';
var tomorrow 	= 'mañana';
var in_days 	= 'días';
var datelabel 	= 'Día';
var morning 	= ['Buenos días','Que tengas un día super cool', 'Que tengas un dia MALACA MALACA'];
var afternoon 	= ['¡Hola bebé!','You look sexy!','Looking good today!'];
var evening 	= ['Wow, You look hot!','You look nice!','Hi, sexy!'];
var feed		= 'http://meneame.feedsportal.com/rss';
var contWelcome = 0;
var usuario;
var statusPanel = false;
var voiceEngine = new VoiceEngine();
//voiceEngine.start();

moment.locale('es');

var weatherParams = {
		'q':'Madrid, España',
		'units':'metric',
		'lang':'es'
	};

$.get('http://127.0.0.1:8000/user').success(function(resp){
	usuario=resp;
	console.log(usuario[0].name);
})


var queueFeeds = []

function queueFeed(feed, title, author, description){

	if(description){
		var div = "<div class='more-left'>"
		+"<div class='newsh'>" + title + " by "+ author+"</div>"
		+"<div class='newsd'>" + description + "</div>";
	}
	else {
		var div = "<div class='more-left'>"
		+"<div class='newsh'>" + title + " by "+ author+"</div>";
	}

	feed.push(div);
}

function printFeed(feed){
	var container = $('#bottomRightContainer');
	container.empty();

	// Print:
	var elems = feed.length;
	if(elems > 0){
		container.html(feed[0]);
		feed.shift();
	}

	//Repeat after timeout:
	setTimeout(function(){printFeed(feed)}, 20000);
}

function updateFeed(feed, feed_url){
	$.ajax({
	  // 'http://stackoverflow.com/feeds/question/10943544'
	  url      : document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(feed_url),
	  dataType : 'json',
	  success  : function (data) {
	    if (data.responseData.feed && data.responseData.feed.entries) {
	      $.each(data.responseData.feed.entries, function (i, e) {
	        //console.log("------------------------");
	        //console.log("title      : " + e.title);
	        //console.log("author     : " + e.author);
	        //console.log("description: " + e.description);

	        queueFeed(feed, e.title, e.author, e.description)

	      });
	    }
	  }
	});

	setTimeout(function() {
		if(feed.length < 1) updateFeed(feed, feed_url);
	}, 10000);
}

function updateTime() {
	var now = new Date();
	var day = now.getDay();
	var date = now.getDate();
	var month = now.getMonth();
	var year = now.getFullYear();

	var date = days[day] + ', ' + date+' ' + months[month] + ' ' + year;


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

function iniciar() {
	$('#container').removeClass('show');
	$('#container').addClass('hide');

	if (contWelcome==0) {
		setTimeout(function () {
			var container = $('#middleContainer');
			var index = Math.floor(Math.random() * morning.length + 0);
			var welcomePhrase = morning[index];
			var div = "<div id='welcomePhrase' class='welcomePhrase'>" + welcomePhrase + ", " + usuario[0].name + "</div>";
			container.append(div);
			contWelcome=1;
		}, 100);
	}

	setTimeout(function() {
		$("#welcomePhrase").removeClass('welcomePhrase');
		$("#welcomePhrase").addClass('welcomePhraseSub');
		$('#container').css('display', 'none');
		$('#menuGestion').addClass('erase');
		$('#calendar').addClass('erase');
		$('#menuOptions').removeClass('erase');
		$(".fichasGestion").removeClass('unminify');
		$(".fichasGestion").addClass('minify');
	}, 200);
	setTimeout(function() {
		$('#gestion').removeClass('gestionSub');
		$('#gestion').addClass('gestion');
		$('#agenda').removeClass('agendaSub');
		$('#agenda').addClass('agenda');
		$('#imagenMicro').removeClass('imagenMicroSub');
		$('#imagenMicro').addClass('imagenMicro');
		$('#salir').removeClass('salirSub');
		$('#salir').addClass('salir');
		$('#inicio').removeClass('inicioSub');
		$('#inicio').addClass('inicio');
		$('#comandos').removeClass('hide');
		$('#comandos').addClass('show');
	}, 300);
}
function standBy(){
	$('#comandos').removeClass('show');
	$('#comandos').addClass('hide');
	$('#welcomePhrase').remove();
	contWelcome=0;
	setTimeout(function() {
		$('#menuOptions').addClass('erase');
		$('#menuGestion').addClass('erase');
		$('#calendar').addClass('erase');
		$(".fichasGestion").removeClass('unminify');
		$(".fichasGestion").addClass('minify');
		$('#container').css('display', 'block');
	}, 100);
	setTimeout(function() {
		$('#container').removeClass('hide');
		$('#container').addClass('show');
	}, 200);
}
function openGestion(){
	$('#container').removeClass('show');
	$('#container').addClass('hide');
	$('#container').css('display', 'none');
	$('#calendar').addClass('erase');
	$('#menuGestion').removeClass('erase');

	setTimeout(function() {
		$('#gestion').removeClass('gestion');
		$('#gestion').addClass('gestionSub');
		$('#agenda').removeClass('agenda');
		$('#agenda').addClass('agendaSub');
		$('#imagenMicro').removeClass('imagenMicro');
		$('#imagenMicro').addClass('imagenMicroSub');
		$('#salir').removeClass('salir');
		$('#salir').addClass('salirSub');
		$('#inicio').removeClass('inicio');
		$('#inicio').addClass('inicioSub');
		$('#menuOptions').removeClass('erase');
		$('#comandos').removeClass('hide');
		$('#comandos').addClass('show');
		$(".fichasGestion").removeClass('minify');
		$(".fichasGestion").addClass('unminify');
	}, 200);
}
function openAgenda(){
	$('#menuGestion').addClass('erase');
	$('#container').removeClass('show');
	$('#container').addClass('hide');
	$('#container').css('display', 'none');
	$('#menuOptions').removeClass('erase');
	$('#gestion').removeClass('gestion');
	$('#gestion').addClass('gestionSub');
	$('#agenda').removeClass('agenda');
	$('#agenda').addClass('agendaSub');
	$('#imagenMicro').removeClass('imagenMicro');
	$('#imagenMicro').addClass('imagenMicroSub');
	$('#salir').removeClass('salir');
	$('#salir').addClass('salirSub');
	$('#inicio').removeClass('inicio');
	$('#inicio').addClass('inicioSub');
	$('#menuOptions').removeClass('erase');
	$('#comandos').removeClass('hide');
	$('#comandos').addClass('show');
	$('#calendar').removeClass('erase');
}
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
	updateFeed(queueFeeds, feed);
	updateCurrentWeather();
	printFeed(queueFeeds);
	$('#calendar').eCalendar();

	$('#topRightContainer').html("<div class='more-right'>"
		+ "<div class='windsun small dimmed' style='display: block;'><span class='wi wi-strong-wind xdimmed'></span> 1 <span class='wi wi-sunset xdimmed'></span> 21:24</div><div class='temp' style='display: block;'><span class='icon dimmed wi wi-day-sunny'></span>27.9°</div><div class='forecast small dimmed' style='display: block;'></div></div>"
		+ "</div>");
})
$('#gestion').click(function(){
	openGestion();
})
$('#inicio').click(function(){
	iniciar();
})
$('#topLeftContainer').click(function(){
	iniciar();
})
$('#agenda').click(function(){
	openAgenda();
})
$('#salir').click(function(){
	standBy();
})

//$('#ActiveHelp').click(function(){
//	if(!statusPanel) {
//		$('#informationPanel').removeClass('hideTool');
//		$('#informationPanel').addClass('showTool');
//		statusPanel = true;
//	}
//	else {
//		$('#informationPanel').removeClass('showTool');
//		$('#informationPanel').addClass('hideTool');
//		statusPanel = false;
//	}
//})

/////////////////////////
///  CONTROLES DE VOZ
/////////////////////////

//voiceEngine.addAction(new VoiceAction("ayuda", function(){
//	$('#informationPanel').removeClass('hideTool');
//	$('#informationPanel').addClass('showTool');
//	statusPanel = true;
//}));
//voiceEngine.addAction(new VoiceAction("cerrar", function(){
//	$('#informationPanel').removeClass('showTool');
//	$('#informationPanel').addClass('hideTool');
//	statusPanel = false;
//}));
voiceEngine.addAction(new VoiceAction("gestión", function(){
	openGestion();
}));
voiceEngine.addAction(new VoiceAction("agenda", function(){
	openAgenda();
}));
voiceEngine.addAction(new VoiceAction("inicio", function(){
	iniciar();
}));
voiceEngine.addAction(new VoiceAction("salir", function(){
	standBy();
}));