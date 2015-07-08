var noble = require('noble');
var request = require('request');
var tripwire = require('tripwire');


// Ignoring me...
var uuid = "0000ffb700001000800000805f9b34fb";


noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		noble.startScanning();
	} else {
		noble.stopScanning();
	}
});


noble.on('discover', function(peripheral) {
    var advertisement = peripheral.advertisement;
    // Noble ignores service uuids... so checking with MAC address
    if(peripheral.address === 'b4:99:4c:73:cd:7b'){
		noble.stopScanning();
		console.log("Beacon Found");
		workout(peripheral);
	}
});


function workout(peripheral) {
	peripheral.on('disconnect', function() {
		console.log("Beacon disconnected");
		process.exit(0);
	});

	peripheral.connect(function(error) {
		if(error){
			console.error(error);
			return;
		}
		console.log("Beacon connected");
		// Connect only temp/hum temp
		peripheral.discoverServices(['ffa0'], function(error, services){
			if(error){
				console.error(error);
				peripheral.disconnect();
				return;
			}
			services.forEach(function(element, index){
				console.log(element.uuid);
				element.discoverCharacteristics([], function(error, characteristics) {
					if(error){
						console.error(error);
						peripheral.disconnect();
						return;
					}
					characteristics.forEach(function(char){
						console.log(char.uuid);
						if(char.uuid === 'ffb7'){
							console.log('fuck yeah');
							char.read(function(err, data){
								tripwire.clearTripwire();
								if(err) console.error(err);
								var sensingData = {"temperature" : data.readUInt32LE(0)/10, "pression" : data.readUInt32LE(4)/10};
								sensingData['place'] = 'beeva';
								console.log(sensingData);;
								request.post('http://localhost:8000/ambient', {'body' : sensingData, 'json':true}, function(err,response,body){
									peripheral.disconnect();
								});
								
							});
						}
					});

				});
			});
		
		});

	});	
};


tripwire.resetTripwire(60000);
