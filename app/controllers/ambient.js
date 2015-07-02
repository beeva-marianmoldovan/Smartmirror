var noble = require('noble');

// Ignoring me...
var uuid = "0000ffb700001000800000805f9b34fb";


function start(callback){
	console.log('Start, ');
	noble.on('discover', function(peripheral) {
	    var advertisement = peripheral.advertisement;
	    // Noble ignores service uuids... so checking with MAC address
	    if(peripheral.address === 'b4:99:4c:73:cd:7b'){
			noble.stopScanning();
			console.log("Beacon Found");
			workout(callback, peripheral);
		}
	});

	noble.startScanning();
}


function workout(callback, peripheral) {
	peripheral.on('disconnect', function() {
		console.log("Beacon disconnected");
	});

	peripheral.connect(function(error) {
		if(error){
			console.error(error);
			callback(error);
			return;
		}
		console.log("Beacon connected");
		// Connect only temp/hum temp
		peripheral.discoverServices(['ffa0'], function(error, services){
			if(error){
				console.error(error);
				peripheral.disconnect();
				callback(error);
				return;
			}
			services.forEach(function(element, index){
				console.log(element.uuid);
				element.discoverCharacteristics([], function(error, characteristics) {
					if(error){
						console.error(error);
						callback(error);
						peripheral.disconnect();
						return;
					}
					characteristics.forEach(function(char){
						console.log(char.uuid);
						if(char.uuid === 'ffb7'){
							console.log('fuck yeah');
							char.read(function(err, data){
								if(err) console.error(err);
								var sensingData = {"temperature" : data.readUInt32LE(0)/10, "humidty" : data.readUInt32LE(4)/10};
								console.log(sensingData);;
								callback(null, sensingData);

								peripheral.disconnect();
							});
						}
					});

				});
			});
		
		});

	});	
};

exports.getAmbientData = function(req, res){
	console.log('Hello');
	start(function(error, sensingData){
		if(error)
			res.status(500).end()
		else res.json(sensingData);
	});
}