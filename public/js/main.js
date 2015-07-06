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
var contWelcome = 0, contFeed = 0;
var queueFeeds = [], queueEvents=[];
var usuario, ambiente, agenda;
var statusPanel = false;
var voiceEngine = new VoiceEngine();
//voiceEngine.start();

moment.locale('es');

var socket = io.connect('http://192.168.0.66:3000');

socket.on('face', function (data) {
	console.log(data);
	if(data.message=='face_detected'){
			var QRdiv = $('body');
			var div = "<div class='WelcomeMessage'>Te estoy viendo, dejame que recuerde si te conozco.</div>"
			QRdiv.append(div);
	}
	if(data.message=='new_face'){
		$.get( '/login').success(function(results){
			$('.welcomeMessage').remove();
			console.log(results);
			var QRdiv = $('body');
			var div = "<div id='QRcode' class='loginQR hide'>"
				+"<img src='"+ results.image.path +"'/>" + "</div>"
			QRdiv.append(div);
			setTimeout(function(){
				$('#QRcode').removeClass('hide');
				$('#QRcode').addClass('show');
			},200)
		});
	}
	if(data.message=='known_face' || data.message=='user_registered'){
		$.get('/user?faceId='+data.face_id).success(function(resp){
			usuario=resp;
			console.log(usuario[0]);
			$.get('/calendar?face_id='+data.face_id).success(function(resp2){
				console.log(resp2);
				if(resp2.tokens.length>0){
					$('.welcomeMessage').remove();
					agenda=resp2;
					console.log(agenda);
					for(var a=0; a<agenda.length;a++){
						var evento={};
						evento.title=agenda[a].summary;
						if(agenda[a].description==undefined)evento.description='';
						else evento.description=agenda[a].description;
						evento.datetime = new Date(agenda[a].start.dateTime);
						evento.datetime.setMonth(evento.datetime.getMonth()+1);
						queueEvents.push(evento);
					}
					$('#calendar').eCalendar(
						{weekDays: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vie', 'Sab'],
							months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
							textArrows: {previous: '<', next: '>'},
							eventTitle: 'Eventos',
							url: '',
							events: queueEvents});
					$('#calendar').addClass('calendar');
					iniciar();
				}
			})
		})
	}
});

var weatherParams = {
		'q':'Madrid, España',
		'units':'metric',
		'lang':'es'
	};

$.get('/ambient').success(function(resp){
	ambiente=resp;
	console.log(ambiente[0].temperature);
	var ambientDiv = $('.more-right');
	var div ="<div id='insideWeather' style='display: block;'><span class='formatoIcono icon dimmed wi-thermometer-internal'></span>"+ambiente[0].temperature+"º</div><div class='forecast small dimmed' style='display: block;'></div></div>"
	ambientDiv.append(div);

})
$.get('/twitter').success(function(resp){
	queueFeeds=resp;
	printFeed();
	contFeed = contFeed+1;
})
function printFeed(){
	$('#feed').remove();
	if(queueFeeds.length>0){
		var nowFeed = queueFeeds[contFeed].tweet;
		var feedDiv = $('#bottomRightContainer');
		var div ="<div id='feed' class='newsh hide'>"+nowFeed+"</div>"
		feedDiv.append(div);
		if(contFeed === queueFeeds.length-1) contFeed = 0;
		else contFeed = contFeed +1;
		setTimeout(function(){
			$('#feed').removeClass('hide');
			$('#feed').addClass('show');
		},100)
	}
}

setInterval(printFeed, 30000);

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
	$('#reservarOptions').removeClass('show');
	$('#reservarOptions').addClass('hide');
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
		$('#reservarOptions').addClass('erase');
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
	$('#reservarOptions').removeClass('show');
	$('#reservarOptions').addClass('hide');
	$('#welcomePhrase').remove();
	contWelcome=0;
	setTimeout(function() {
		$('#menuOptions').addClass('erase');
		$('#menuGestion').addClass('erase');
		$('#reservarOptions').addClass('erase');
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
	$('#reservarOptions').addClass('erase');
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
	$('#reservarOptions').addClass('erase');
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
$('#reservarSala').click(function(){
	setTimeout(function() {
		$('#menuGestion').addClass('erase');
		$('#calendar').addClass('erase');
		$(".fichasGestion").removeClass('unminify');
		$(".fichasGestion").addClass('minify');
		$(".reservarOptions").removeClass('erase');
	}, 100);
	setTimeout(function() {
		$('#reservarOptions').removeClass('hide');
		$('#reservarOptions').addClass('show');
	}, 200);

})
$('.sala').click(function(){
	console.log(this.id);
	$('.salaUp').addClass('salaSub');
	$('.salaUp').removeClass('salaUp');
	$('.sala').addClass('salaSub');
	$('.sala').removeClass('sala');
	$('#'+this.id).removeClass('salaSub');
	$('#'+this.id).addClass('salaUp');
	setTimeout(function(){
		$('#calendar1').removeClass('erase');
	},200)
	setTimeout(function(){
		$('#calendar1').removeClass('hide');
		$('#calendar1').addClass('show');
	},300)
})
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
	updateCurrentWeather();
	//$('#calendar1').
	$('#calendar1').addClass('calendar2');

	$('#topRightContainer').html("<div class='more-right'>"
		+ "<div class='windsun small dimmed' style='display: block;'><span class='wi wi-strong-wind xdimmed'></span> 1 <span class='wi wi-sunset xdimmed'></span> </div><div class='temp' style='display: block;'><span class='icon dimmed wi wi-day-sunny'></span></div><div class='forecast small dimmed' style='display: block;'></div>"
		+ "</div>"
		+ "</div>");
})
$('#gestion').click(function(){
	openGestion();
})
//$('#topLeftContainer').click(function(){
//	iniciar();
//})
$('#agenda').click(function(){
	openAgenda();
})
$('#salir').click(function(){
	standBy();
})

/////////////////////////
///  CONTROLES DE VOZ
/////////////////////////

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