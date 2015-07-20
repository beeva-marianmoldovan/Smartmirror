'use strict';

var days 		= ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
var months 		= ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var morning 	= ['Buenos días','Que tengas un día super cool', 'Propicios días'];
var afternoon 	= ['¡Hola bebé!','You look sexy!','Looking good today!'];
var evening 	= ['Wow, You look hot!','You look nice!','Hi, sexy!'];
var feed		= 'http://meneame.feedsportal.com/rss';
var contWelcome = 0, contFeed = 0;
var queueFeeds = [], queueEvents=[], salaList={};
var usuario, ambiente, agenda, salaActual, nombreSalaPrinp,faceID, keepSessionTime = 12000;
var voiceEngine = new VoiceEngine();
//voiceEngine.start();

moment.locale('es');

var socket = io.connect('http://localhost:3000');

socket.on('face', function (data) {
	faceID = data.faceId;
	if(data.message=='face_detected'){
		$('#QRcode').remove();
		var QRdiv = $('body');
		var div = "<div class='WelcomeMessage'>Te estoy viendo, dejame que recuerde si te conozco.</div>"
		QRdiv.append(div);
	}
	if(data.message=='new_face'){
		$.get( '/login?user=' + faceID).success(function(results){
			$('.welcomeMessage').remove();
			var QRdiv = $('body');
			var div = "<div id='QRcode' class='loginQR hide'>"
				+"<img src='"+ results.image.path +"'/>" + "</div>"
			QRdiv.append(div);
			setTimeout(function(){
				$('#QRcode').removeClass('hide');
				$('#QRcode').addClass('show');
			},200)
			keepSessionTime = 300000;
		});
	}
	if(data.message=='known_face' || data.message=='user_registered'){
		$.get('/user?faceId='+faceID).success(function(resp){
			console.log(resp);
			if(resp.length > 0 && resp[0].tokens.length>0){
				$('#QRcode').remove();
				$('.welcomeMessage').remove();
				usuario=resp;
				$.get('/calendar/resources?face_id='+faceID).success(function(resp3){
					console.log('resources: ',resp3);
					for(var a = 0; a < resp3.length; a++){
						var salasDiv = $('#reservarOptions');
						if(resp3[a].resources==undefined) resp3[a].resources = '';
						var div ="<div id='sala"+a+"' value='"+resp3[a].roomId+"' class='sala'>"
							+"<div class='detalleSala'>"+resp3[a].room+"<p class='salaDisponible'>Horarios disponibles ahora</p>"+"</div>"
							+"<div class='detalleSala cap'><p>"+ resp3[a].capacity+" personas</p></div>"
							+"<div class='detalleSala equ'><p>"+ resp3[a].resources+"</p></div>"
							+"</div>"
						salasDiv.append(div);
						salaList['sala'+a] = resp3[a].roomId;
					}
					$('.sala').click(function(){
						$('#calendar1').removeClass('show');
						$('#calendar1').addClass('hide');
						nombreSalaPrinp = $('#'+this.id)[0].attributes[1].value;
						var idLabel = this.id;
						loadSalasAvailability(faceID, idLabel);
					})
				})
				$('.horasReserva').click(function(){
					var label = this.id;
					var date = new Date().toISOString().substr(0, 11);
					var rightNowStart = date+this.textContent.substr(0,5)+":00+02:00";
					var rightNowEnd = date+this.textContent.substr(7,6)+":00+02:00";
					reservarSala(nombreSalaPrinp,salaActual,faceID,rightNowStart,rightNowEnd, label);
				})
				$('.salaAhora').click(function(){
					var label = this.id;
					var date = new Date().toISOString().substr(0, 11);
					var now = new Date();
					var horaActual = now.getHours();
					var minutoActual = now.getMinutes();
					if(minutoActual>30) { minutoActual='00'; horaActual= horaActual+1; var horaFin = horaActual; var minutoFin = '30'; }
					else { minutoActual='30'; var horaFin= horaActual+1;var minutoFin = '00'}
					console.log(date, horaActual, minutoActual);
					var rightNowStart = date+horaActual+':'+minutoActual+":00+02:00";
					var rightNowEnd = date+horaFin+':'+minutoFin+":00+02:00";
					console.log(rightNowStart,rightNowEnd);
					//reservarSala(nombreSalaPrinp,salaActual,faceID,rightNowStart,rightNowEnd, label);
				})
				iniciar();
			}
			else {
				$('.welcomeMessage').remove();
				$.get( '/login?user='+faceID).success(function(results){
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
		})
	}
	if(data.message=='no_face_now'){
		setTimeout(function(){
			standBy();
		},keepSessionTime)
	}
});

var weatherParams = {
	'q':'Madrid, España',
	'units':'metric',
	'lang':'es'
};
 function loadCalendar() {
	 queueEvents = [];
	 $.get('/calendar/next?face_id='+faceID).success(function(resp2){
		 agenda=resp2;
		 for(var a=0; a<agenda.length;a++) {
			 var evento = {};
			 evento.title = agenda[a].summary;
			 if (agenda[a].description == undefined)evento.description = '';
			 else evento.description = agenda[a].description;
			 evento.datetime = new Date(agenda[a].start.dateTime);
			 evento.datetime.setMonth(evento.datetime.getMonth() + 1);
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
	 })
 }


function loadSalasAvailability(faceID,idLabel){
	$.post( "/calendar/availability?face_id="+faceID, { resourceID: salaList[idLabel] } )
		.success(function(respSalas){
			//console.log(this);
			$('.ahoraOption').removeClass('fondoOcupada');
			$('.ahoraOption').addClass('fondoLibre');
			$('.horasReserva').removeClass('fondoOcupada');
			$('.horasReserva').addClass('fondoLibre');
			salaActual = this.data.replace('resourceID=','');
			salaActual = salaActual.replace('%40','@');
			var now = new Date();
			var horaActual = now.getHours();
			var minutoActual = now.toTimeString().substring(3,5);
			//console.log(horaActual, minutoActual);
			var horariosMoment = respSalas.calendars[salaActual].busy;
			for(var e=0; e<respSalas.calendars[salaActual].busy.length;e++){
				//console.log(horaActual,moment(horariosMoment[e].start).hour(),moment(horariosMoment[e].end).hour());
				if(horaActual>=(moment(horariosMoment[e].start).hour()) && horaActual<=(moment(horariosMoment[e].end).hour()) ){
					//console.log('entra');
					$('.ahoraOption').removeClass('fondoLibre');
					$('.ahoraOption').addClass('fondoOcupada');
				}
				var minutosInicio = moment(horariosMoment[e].start).minutes();
				var minutosFinal = moment(horariosMoment[e].end).minutes();
				if(minutosInicio > 0) minutosInicio = 0.5;
				if(minutosFinal > 0) minutosFinal = 0.5;
				var horaInicio = (moment(horariosMoment[e].start).hour())+minutosInicio;
				var horaFin = (moment(horariosMoment[e].end).hour())+minutosFinal;
				var panelHorarios = $('#calendar1').children(".horasReserva");
				for (var i=0;i<panelHorarios.length; i++){
					var  valorCompara = $('#'+panelHorarios[i].id)[0].attributes[1].value;
					if(valorCompara >= horaInicio && valorCompara < horaFin){
						$('#'+panelHorarios[i].id).removeClass('fondoLibre');
						$('#'+panelHorarios[i].id).addClass('fondoOcupada');
					}
				}
			}
			setTimeout(function(){
				$('#calendar1').removeClass('hide');
				$('#calendar1').addClass('show');
			},500)
		});
	setTimeout(function(){
		$('.sala').addClass('salaSub');
		$('.sala').removeClass('sala');
		$('#salaAhora').addClass('erase');
	},50)
	setTimeout(function(){
		$('.salaUp').addClass('salaSub');
		$('.salaUp').removeClass('salaUp');
	},70)
	setTimeout(function(){
		$('.salasub').children('.cap').addClass('hide');
		$('.salasub').children('.equ').addClass('hide');
		$('.salasub').children().children('.salaDisponible').addClass('hide');
	},75)
	setTimeout(function(){
		$('#'+idLabel).removeClass('salaSub');
		$('#'+idLabel).addClass('salaUp');
	},80)
	setTimeout(function(){
		$('.salaUp').children('.cap').removeClass('hide');
		$('.salaUp').children('.equ').removeClass('hide');
		$('.salaUp').children().children('.salaDisponible').removeClass('hide');
	},100)
	setTimeout(function(){
		$('#calendar1').removeClass('erase');
	},200)
}

function reservarSala(nombreSalaPrinp, salaActual, faceID, start, end, label){
	var node = start.replace(/\s+/, "");
	var node2 = end.replace(/\s+/, "");
	$.post( "/calendar/create?face_id="+faceID,
		{
			"location":nombreSalaPrinp,
			"start": {"dateTime":node},
			"end": {"dateTime":node2},
			"attendees": [{"email":salaActual}]
		})
	$('#'+label).removeClass('fondoLibre');
	$('#'+label).addClass('fondoOcupada');
}
function getAmbient(){
	$.get('/ambient').success(function(resp){
		$('#insideWeather').remove();
		ambiente=resp;
		var ambientDiv = $('.more-right');
		var div ="<div id='insideWeather' style='display: block;'><span class='formatoIcono icon dimmed wi-thermometer-internal'></span>"+ambiente[0].temperature+"º</div><div class='forecast small dimmed' style='display: block;'></div></div>"
		ambientDiv.append(div);

	})
}
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
	$('#reservarAhora').removeClass('show');
	$('#reservarAhora').addClass('hide');
	if (contWelcome==0) {
		setTimeout(function () {
			var container = $('#middleContainer');
			var index = Math.floor(Math.random() * morning.length + 0);
			var welcomePhrase = morning[index];
			var div = "<div id='welcomePhrase' class='welcomePhrase'>" + welcomePhrase + ", " + usuario[0].name.split(" ")[0] + "</div>";
			container.append(div);
			contWelcome=1;
		}, 100);
	}

	setTimeout(function() {
		$("#welcomePhrase").removeClass('welcomePhrase');
		$("#welcomePhrase").addClass('welcomePhraseSub');
		$('#container').css('display', 'none');
		$('#calendar').addClass('erase');
		$('#reservarOptions').addClass('erase');
		$('#reservarAhora').addClass('erase');
		$('#menuOptions').removeClass('erase');
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
	$('#reservarAhora').removeClass('show');
	$('#reservarAhora').addClass('hide');
	$('#welcomePhrase').remove();
	contWelcome=0;
	queueEvents=[];
	setTimeout(function() {
		$('#menuOptions').addClass('erase');
		$('.sala').remove();
		$('.salaUp').remove();
		$('.salaSub').remove();
		$('#reservarOptions').addClass('erase');
		$('#reservarAhora').addClass('erase');
		$('#calendar').addClass('erase');
		$('#calendar1').addClass('erase');
		$('#container').css('display', 'block');
	}, 100);
	setTimeout(function() {
		$('#container').removeClass('hide');
		$('#container').addClass('show');
	}, 200);
}
function openAgenda(){
	loadCalendar();
	$('#reservarOptions').addClass('erase');
	$('#reservarAhora').addClass('erase');
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
function reservar(){
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
	$('#comandos').removeClass('hide');
	$('#comandos').addClass('show');
	$('#reservarAhora').removeClass('show');
	$('#reservarAhora').addClass('hide');
	$('#calendar1').removeClass('show');
	$('#calendar1').addClass('hide');
	setTimeout(function() {
		$('#calendar').addClass('erase');
		$('#calendar1').addClass('erase');
		$('#reservarAhora').addClass('erase');
		$("#reservarOptions").removeClass('erase');
		$('#menuOptions').removeClass('erase');
		$('.salaUP').addClass('sala');
		$('.salaUP').removeClass('salaUp');
		$('.salaSub').addClass('sala');
		$('.salaSub').removeClass('salaSub');
	}, 100);
	setTimeout(function() {
		$('#reservarOptions').removeClass('hide');
		$('#reservarOptions').addClass('show');
	}, 300);
	setTimeout(function() {
		$('.detalleSala').removeClass('hide');
		$('.detalleSala').addClass('show');
		$('.salaDisponible').removeClass('hide');
		$('.salaDisponible').addClass('show');
	}, 1000);
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
	getAmbient();
	setInterval(getAmbient, 300000);
	updateCurrentWeather();
	$('#calendar1').addClass('calendar2');

	$('#topRightContainer').html("<div class='more-right'>"
		+ "<div class='windsun small dimmed' style='display: block;'><span class='wi wi-strong-wind xdimmed'></span> 1 <span class='wi wi-sunset xdimmed'></span> </div><div class='temp' style='display: block;'><span class='icon dimmed wi wi-day-sunny'></span></div><div class='forecast small dimmed' style='display: block;'></div>"
		+ "</div>"
		+ "</div>");
})
$('#gestion').click(function(){
	reservar();
})
$('#inicio').click(function(){
	iniciar();
})
$('#agenda').click(function(){
	openAgenda();
})
$('#salir').click(function(){
	standBy();
})

/////////////////////////
///  CONTROLES DE VOZ
/////////////////////////

voiceEngine.addAction(new VoiceAction("reservar", function(){
	reservar();
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