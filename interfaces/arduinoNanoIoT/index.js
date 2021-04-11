var server = require('@libraries/hardwareInterfaces');
var settings = server.loadHardwareInterface(__dirname);

const fetch = require('node-fetch');

exports.enabled = settings('enabled');
exports.configurable = true;

var objectName = "ArduinoNanoIoT";
var TOOL_NAME = "ArduinoNanoIoT1";

var defaultIP = "192.168.50.174"

var sensorRefresh = 100;


// set vars for input values from Arduino IoT
var accelX;
var accelY;
var accelZ;
var signalStrength;

//
// Function to send data from listener nodes and set values for writer nodes
//
var body; // sample payload for body of arduinoComm
//
async function arduinoComm(ip,payload) {
    // if (isEmpty(payload)) {
    //     console.log('set default payload')
    //     payload = { '13': 1}; // set default payload
    // }
    fetch('http://'+ip, { 
        method: 'POST', 
        timeout: 5000,
        body:    JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.text())
    .then(json => {
        // console.log(json)
        return JSON.parse(json)
    })
    .then(body => {
        accelX = body.AccelX;
        accelY = body.AccelY;
        accelZ = body.AccelZ;
        signalStrength = body.SignalStrength;

        server.write(objectName, TOOL_NAME, "accelerometerX", accelX, "f");
        server.write(objectName, TOOL_NAME, "accelerometerY", accelY, "f");
        server.write(objectName, TOOL_NAME, "accelerometerZ", accelZ, "f");
        server.write(objectName, TOOL_NAME, "signalStrength", signalStrength, "f");
    })
    .catch(err => console.error(err));
    setTimeout(() => { arduinoComm(defaultIP,body); }, sensorRefresh);
    console.log(payload)
}


if (exports.enabled) {
    setup();

    function setup() {
        exports.settings = {
            nanoName: {

                value: settings('objectName', objectName),
                type: 'text',
                default: objectName,
                disabled: false,
                helpText: 'The name of the object that connects to this hardware interface'
            },
            // Complexity level for the object
           nanoIP: { 
                value: settings('nanoIP', defaultIP), 
                type: 'text',
                default: defaultIP,
                disabled: false,
                helpText: 'The IP address of your Arduino Nano IoT on the same network as the Vuforia Edge Server'
            }
        };
    }

    objectName = exports.settings.nanoName.value;
    defaultIP = exports.settings.nanoIP.value;
    console.log("microbit: " + objectName);
    console.log("with complexity: " + defaultIP);


    server.addEventListener('reset', function () {
        settings = server.loadHardwareInterface(__dirname);
        setup();

        console.log("Microbit: Settings Loaded: ", objectName);

    }) 
}

function startHardwareInterface() {
    console.log('Arduino IoT: Starting up')

    server.enableDeveloperUI(true)

    server.addNode(objectName, TOOL_NAME, "accelerometerX", "node");
    server.addNode(objectName, TOOL_NAME, "accelerometerY", "node");
    server.addNode(objectName, TOOL_NAME, "accelerometerZ", "node");
    server.addNode(objectName, TOOL_NAME, "signalStrength", "node");
    server.addNode(objectName, TOOL_NAME, "led", "node");
    
    server.addReadListener(objectName, TOOL_NAME, "led", function(data){
        console.log("in read listener");
        if (data.value == 1) {
            // console.log("data is 1");
            setTimeout(() => { body = { '13': 1}; } , 0);
        }
        else if (data.value == 0) {
            // console.log("data is 0");
            setTimeout(() => { body = { '13': 0}; } , 0);
            // console.log("wrote to port");
        }
    });

    arduinoComm(defaultIP,body);

    updateEvery(0, 1000);

}

function updateEvery(i, time){
    setTimeout(() => {
        updateEvery(++i, time);
    }, time)
}

server.addEventListener("initialize", function () {
    if (exports.enabled) setTimeout(() => { 
        body = { '13': 0};
        startHardwareInterface();
    }, 1000)
});

