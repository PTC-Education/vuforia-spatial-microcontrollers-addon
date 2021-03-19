var server = require('@libraries/hardwareInterfaces');
var serial = require('./serial.js');
var settings = server.loadHardwareInterface(__dirname);

exports.enabled = settings('enabled');
exports.configurable = true;

var objectName = "microbit";
var TOOL_NAME = "MicroBit1";

serial.openPort();

if (exports.enabled) {
    setup();

    function setup() {
        exports.settings = {
            microbitName: {
                value: settings('objectName', objectName),
                type: 'text',
                default: objectName,
                disabled: false,
                helpText: 'The name of the object that connects to this hardware interface'
            }
        };
    }
    objectName = exports.settings.microbitName.value;
    console.log("microbit: " + objectName);

    server.addEventListener('reset', function () {
        settings = server.loadHardwareInterface(__dirname);
        setup();

        console.log("Microbit: Settings Loaded: ", objectName);
    }) 
}

function startHardwareInterface() {
    console.log('microbit: Starting up')

    server.enableDeveloperUI(true)

    server.addNode(objectName, TOOL_NAME, "screen", "node");
    server.addNode(objectName, TOOL_NAME, "temp", "node");
    

    server.addReadListener(objectName, TOOL_NAME, "screen", function(data){
    	console.log("in read listener");
    	if (data.value == 1) {
    		console.log("data is 1");
    		setTimeout(() => { serial.writePort("1,"); } , 0);
    		console.log("wrote to port");
    	}
    	else if (data.value == 0) {
    		console.log("data is 0");
    		setTimeout(() => { serial.writePort("0,"); } , 0);
    		console.log("wrote to port");
    	}
    });

    setTempVal();

    updateEvery(0, 10);

}

function updateEvery(i, time){
setTimeout(() => {
	updateEvery(++i, time);
}, time)
}

function setTempVal() {
    sensorData = serial.readTemp();
    server.write(objectName, TOOL_NAME, "temp", parseInt(sensorData), "f");
    setInterval(() => { setTempVal(); }, 2000);
}

server.addEventListener("initialize", function () {
    if (exports.enabled) setTimeout(() => { startHardwareInterface() }, 1000)
});
