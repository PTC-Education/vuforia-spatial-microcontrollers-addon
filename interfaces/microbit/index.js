var server = require('@libraries/hardwareInterfaces');
var serial = require('./serial.js');
var settings = server.loadHardwareInterface(__dirname);

exports.enabled = settings('enabled');
exports.configurable = true;

var objectName = "microbit";
var TOOL_NAME = "MicroBit1";
var complexity = "MicroBit1"

var sensorRefresh = 50;

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
            },
            // Complexity level for the object
            microbitComplexity: { 
                value: settings('microbitComplexity', 'beginner'), 
                type: 'text',
                default: 'beginner',
                disabled: false,
                helpText: 'The complexity of the interface. "beginner" gives a few nodes, If you want super accurate sensor data, \
                you can use the complexity "sensor" to get faster sensor data in exchange for no motor control.'
            }
        };
    }
    objectName = exports.settings.microbitName.value;
    complexity = exports.settings.microbitComplexity.value.toLowerCase();
    complexity = complexity.replace(/\n/g,'');
    console.log("microbit: " + objectName);
    console.log("with complexity: " + complexity);

    server.addEventListener('reset', function () {
        settings = server.loadHardwareInterface(__dirname);
        setup();

        console.log("Microbit: Settings Loaded: ", objectName);
    }) 
}

function startHardwareInterface() {
    console.log('microbit: Starting up')

    server.enableDeveloperUI(true)

    if (complexity == 'sensor' || complexity == 'beginner') {
        server.addNode(objectName, TOOL_NAME, "accelerometerX", "node", {x: 60, y: -20, scale:0.135});
        server.addNode(objectName, TOOL_NAME, "buttonA", "node", {x: -50, y: -40, scale:0.135});
        server.addNode(objectName, TOOL_NAME, "buttonB", "node", {x: -50, y: -20, scale:0.135});

        if (complexity == 'beginner') {
            server.addNode(objectName, TOOL_NAME, "screen", "node", {x: 60, y: 0, scale:0.135});

            server.removeNode(objectName, TOOL_NAME, "accelerometerY");
            server.removeNode(objectName, TOOL_NAME, "accelerometerZ");
            server.removeNode(objectName, TOOL_NAME, "brightness");
            server.removeNode(objectName, TOOL_NAME, "temp");

            sensorRefresh = 50;
        }

        if (complexity == 'sensor') {
            server.removeNode(objectName, TOOL_NAME, "screen");

            server.addNode(objectName, TOOL_NAME, "accelerometerY", "node", {x: 60, y: 0, scale:0.135});
            server.addNode(objectName, TOOL_NAME, "accelerometerZ", "node", {x: 60, y: 20, scale:0.135});
            server.addNode(objectName, TOOL_NAME, "brightness", "node", {x: -50, y: 0, scale:0.135});
            server.addNode(objectName, TOOL_NAME, "temp", "node", {x: -50, y: 20, scale:0.135});

            sensorRefresh = 10;
        }
    }
    

    server.addReadListener(objectName, TOOL_NAME, "screen", function(data){
        console.log("in read listener");

        var info = String(data.value);
        var end = ",";
        var val = info.concat(end);
        setTimeout(() => { serial.writePort(val); }, 0);
    });

    readSensor();

    updateEvery(0, 10);

}

function updateEvery(i, time){
    setTimeout(() => {
        updateEvery(++i, time);
    }, time)
}

async function readSensor() {
    var sensorData = serial.getSensor();
    
    server.write(objectName, TOOL_NAME, "temp", parseInt(sensorData[0]), "f");
    server.write(objectName, TOOL_NAME, "accelerometerX", parseInt(sensorData[1]), "f");
    server.write(objectName, TOOL_NAME, "accelerometerY", parseInt(sensorData[2]), "f");
    server.write(objectName, TOOL_NAME, "accelerometerZ", parseInt(sensorData[3]), "f");
    server.write(objectName, TOOL_NAME, "brightness", parseInt(sensorData[4]), "f");
    server.write(objectName, TOOL_NAME, "buttonA", parseInt(sensorData[5]), "f");
    server.write(objectName, TOOL_NAME, "buttonB", parseInt(sensorData[6]), "f");

    setTimeout(() => { readSensor(); }, sensorRefresh);
}

server.addEventListener("initialize", function () {
    if (exports.enabled) setTimeout(() => { startHardwareInterface() }, 1000)
});
