/*
 *     index.js
 *     Alina Shah, 4/29/2021
 *     micro:bit
 *
 *     Defines nodes for interface and their behavior
 */


var server = require('@libraries/hardwareInterfaces');
var serial = require('./serial.js');
var settings = server.loadHardwareInterface(__dirname);

exports.enabled = settings('enabled');
exports.configurable = true;

var objectName = "microbit";
var TOOL_NAME = "MicroBit1";
var complexity = "MicroBit1"

// global vars that allow access to read/write digital/analog pin names
var analogRead = "A0 A1 A2 A3";
var analogWrite = "A4 A5 A6 A7";
var digitalWrite = "D8 D9 D10 D11 D12";
var digitalRead = "D13 D14 D15 D16";
var readPins = "";
var writePins = "";
var readDigitalNames = [];
var readAnalogNames = [];
var writeDigitalNames = [];
var writeAnalogNames = [];
var analogArr = [];

// set to 50 for beginner mode
var sensorRefresh = 50;

// opens serial port
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
            },
            // Analog Pins to read from
            analogRead: {
                value: settings('analogRead', analogRead),
                type: 'text',
                default: analogRead,
                disabled: false,
                helpText: 'Choose which analogRead pins to use from the list: A0 A1 A2 A3'
            },
            // Analog pins to write to
            analogWrite: {
                value: settings('analogWrite', analogWrite),
                type: 'text',
                default: analogWrite,
                disabled: false,
                helpText: 'Choose which analogWrite pins to use from the list: A4 A5 A6 A7'
            },
            // Digital pins to write to
            digitalWrite: {
                value: settings('digitalWrite', digitalWrite),
                type: 'text',
                default: digitalWrite,
                disabled: false,
                helpText: 'Choose which digitalWrite pins to use from the list: D13 D14 D15 D16'
            },
            // Digital pins to read from
            digitalRead: {
                value: settings('digitalRead', digitalRead),
                type: 'text',
                default: digitalRead,
                disabled: false,
                helpText: 'Choose which digitalRead pins to use from the list: D8 D9 D10 D11 D12'
            }
        };
    }
    // Gets each value from the localhost and prints to ensure they are correct
    objectName = exports.settings.microbitName.value;
    complexity = exports.settings.microbitComplexity.value.toLowerCase();
    complexity = complexity.replace(/\n/g,'');
    analogRead = exports.settings.analogRead.value;
    analogRead = analogRead.replace(/\n/g,'');
    analogWrite = exports.settings.analogWrite.value;
    analogWrite = analogWrite.replace(/\n/g,'');
    digitalRead = exports.settings.digitalRead.value;
    digitalRead = digitalRead.replace(/\n/g,'');
    digitalWrite = exports.settings.digitalWrite.value;
    digitalWrite = digitalWrite.replace(/\n/g,'');
    console.log("microbit: " + objectName);
    console.log("with complexity: " + complexity);
    console.log("using analogRead pins: " + analogRead);
    console.log("using analogWrite pins: " + analogWrite);
    console.log("using digitalRead pins: " + digitalRead);
    console.log("using digitalWrite pins: " + digitalWrite);

    server.addEventListener('reset', function () {
        settings = server.loadHardwareInterface(__dirname);
        setup();

        console.log("Microbit: Settings Loaded: ", objectName);
    }) 
}

function startHardwareInterface() {
    console.log('microbit: Starting up')

    server.enableDeveloperUI(true)

    // Defineds complexity levels for micro:bit (sensor and beginner)
    if (complexity == 'sensor' || complexity == 'beginner') {
        server.addNode(objectName, TOOL_NAME, "accelerometerX", "node", {x: 60, y: -30, scale:0.125});
        server.addNode(objectName, TOOL_NAME, "buttonA", "node", {x: -50, y: -60, scale:0.125});
        server.addNode(objectName, TOOL_NAME, "buttonB", "node", {x: -50, y: -30, scale:0.125});

        if (complexity == 'beginner') {
            server.addNode(objectName, TOOL_NAME, "screen", "node", {x: 60, y: -60, scale:0.125});

            server.removeNode(objectName, TOOL_NAME, "accelerometerY");
            server.removeNode(objectName, TOOL_NAME, "accelerometerZ");
            server.removeNode(objectName, TOOL_NAME, "brightness");
            server.removeNode(objectName, TOOL_NAME, "temp");

            sensorRefresh = 50;
        }

        if (complexity == 'sensor') {
            server.removeNode(objectName, TOOL_NAME, "screen");

            server.addNode(objectName, TOOL_NAME, "accelerometerY", "node", {x: 60, y: 0, scale:0.125});
            server.addNode(objectName, TOOL_NAME, "accelerometerZ", "node", {x: 60, y: 30, scale:0.125});
            server.addNode(objectName, TOOL_NAME, "brightness", "node", {x: -50, y: 0, scale:0.125});
            server.addNode(objectName, TOOL_NAME, "temp", "node", {x: -50, y: 30, scale:0.125});

            sensorRefresh = 10;
        }
    }

    // Adds each digital read node
    readDigitalNames =  digitalRead.split(" ");
    var readDigitalLen = readDigitalNames.length;
    for (var i = 0; i < readDigitalLen; ++i) {
        readDigitalNames[i] = "R".concat(readDigitalNames[i])
        server.addNode(objectName, TOOL_NAME, readDigitalNames[i], "node");
    }

    // Adds each digital write node
    writeDigitalNames =  digitalWrite.split(" ");
    var writeDigitalLen = writeDigitalNames.length;
    for (var i = 0; i < writeDigitalLen; ++i) {
        writeDigitalNames[i] = "W".concat(writeDigitalNames[i]);
        server.addNode(objectName, TOOL_NAME, writeDigitalNames[i], "node");
    }

    // Adds each analog read node
    readAnalogNames =  analogRead.split(" ");
    var readAnalogLen = readAnalogNames.length;
    for (var i = 0; i < readAnalogLen; ++i) {
        readAnalogNames[i] = "R".concat(readAnalogNames[i])
        server.addNode(objectName, TOOL_NAME, readAnalogNames[i], "node");
    }

    // Adds each analog write node
    writeAnalogNames =  analogWrite.split(" ");
    var writeAnalogLen = writeAnalogNames.length;
    for (var i = 0; i < writeAnalogLen; ++i) {
        writeAnalogNames[i] = "W".concat(writeAnalogNames[i]);
        server.addNode(objectName, TOOL_NAME, writeAnalogNames[i], "node");
    }

    // Replaces 'A' with 'P' so that correct pin name can be sent to serial port
    var analogTemp = analogWrite.replace(/A/g,'P');
    var analogTempArr = analogTemp.split(" ");

    // Read listener for first analog write pin
    var name1 = analogTempArr[0];
    server.addReadListener(objectName, TOOL_NAME, writeAnalogNames[0], function(data){
        var writeAnalogVal = data.value + name1 + ",";
        console.log("analog val within loop: " + writeAnalogVal);
        setTimeout(() => { serial.writePort(writeAnalogVal); } , 0);
    });

    // Read listener for second analog write pin
    var name2 = analogTempArr[1];
    server.addReadListener(objectName, TOOL_NAME, writeAnalogNames[1], function(data){
        var writeAnalogVal = data.value + name2 + ",";
        console.log("analog val within loop: " + writeAnalogVal);
        setTimeout(() => { serial.writePort(writeAnalogVal); } , 0);
    });

    // Read listener for third analog write pin
    var name3 = analogTempArr[2];
    server.addReadListener(objectName, TOOL_NAME, writeAnalogNames[2], function(data){
        var writeAnalogVal = data.value + name3 + ",";
        console.log("analog val within loop: " + writeAnalogVal);
        setTimeout(() => { serial.writePort(writeAnalogVal); } , 0);
    });

    // Read listener for fourth analog write pin
    var name4 = analogTempArr[3];
    server.addReadListener(objectName, TOOL_NAME, writeAnalogNames[3], function(data){
        var writeAnalogVal = data.value + name4 + ",";
        console.log("analog val within loop: " + writeAnalogVal);
            setTimeout(() => { serial.writePort(writeAnalogVal); } , 0);
    });


    // Replaces 'D' with 'P' so that correct pin name can be sent to serial port
    var digitalTemp = digitalWrite.replace(/D/g, 'P');
    var digitalTempArr = digitalTemp.split(" ");

    // Read listener for first digital write pin
    var dname1 = digitalTempArr[0];
    server.addReadListener(objectName, TOOL_NAME, writeDigitalNames[0], function(data) {
        var writeDigitalVal = data.value + dname1 + ",";
        console.log("digital val within loop: " + writeDigitalVal);
        setTimeout(() => { serial.writePort(writeDigitalVal); } , 0);
    });

    // Read listener for second digital write pin
    var dname2 = digitalTempArr[1];
    server.addReadListener(objectName, TOOL_NAME, writeDigitalNames[1], function(data) {
        var writeDigitalVal = data.value + dname2 + ",";
        console.log("digital val within loop: " + writeDigitalVal);
        setTimeout(() => { serial.writePort(writeDigitalVal); } , 0);
    });

    // Read listener for third digital write pin
    var dname3 = digitalTempArr[2];
    server.addReadListener(objectName, TOOL_NAME, writeDigitalNames[2], function(data) {
        var writeDigitalVal = data.value + dname3 + ",";
        console.log("digital val within loop: " + writeDigitalVal);
        setTimeout(() => { serial.writePort(writeDigitalVal); } , 0);
    });

    // Read listener for fourth digital write pin
    var dname4 = digitalTempArr[3];
    server.addReadListener(objectName, TOOL_NAME, writeDigitalNames[3], function(data) {
        var writeDigitalVal = data.value + dname4 + ",";
        console.log("digital val within loop: " + writeDigitalVal);
        setTimeout(() => { serial.writePort(writeDigitalVal); } , 0);
    });

    // Read listener for fifth digital write pin
    var dname5 = digitalTempArr[4];
    server.addReadListener(objectName, TOOL_NAME, writeDigitalNames[4], function(data) {
        var writeDigitalVal = data.value + dname5 + ",";
        console.log("digital val within loop: " + writeDigitalVal);
        setTimeout(() => { serial.writePort(writeDigitalVal); } , 0);
    });  

    // Read listener for screen node
    server.addReadListener(objectName, TOOL_NAME, "screen", function(data){
        var info = String(data.value);
        var end = "#,";
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

// updates sensor nodes and read pin nodes
// order of sensorData: temperature, accelX, accelY, accelZ, brightness, buttonA, buttonB, D13, D14, D15, D16, A0, A1, A2, A3
async function readSensor() {
    // get array of sensor and pin values from port
    var sensorData = serial.getSensor();
    
    // write each sensor and button value to their respective node
    server.write(objectName, TOOL_NAME, "temp", parseInt(sensorData[0]), "f");
    server.write(objectName, TOOL_NAME, "accelerometerX", parseInt(sensorData[1]), "f");
    server.write(objectName, TOOL_NAME, "accelerometerY", parseInt(sensorData[2]), "f");
    server.write(objectName, TOOL_NAME, "accelerometerZ", parseInt(sensorData[3]), "f");
    server.write(objectName, TOOL_NAME, "brightness", parseInt(sensorData[4]), "f");
    server.write(objectName, TOOL_NAME, "buttonA", parseInt(sensorData[5]), "f");
    server.write(objectName, TOOL_NAME, "buttonB", parseInt(sensorData[6]), "f");

    // write the digital read pin values to their nodes
    var readDigitalLen = readDigitalNames.length;
    for (var i = 0; i < readDigitalLen; ++i) {
        server.write(objectName, TOOL_NAME, readDigitalNames[i], parseInt(sensorData[i + 7]), "f");
    }

    // write the analog read pin values to their nodes
    var readAnalogLen = readAnalogNames.length;
    for (var i = 0; i < readAnalogLen; ++i) {
        server.write(objectName, TOOL_NAME, readAnalogNames[i], parseInt(sensorData[i + 12]), "f");
    }

    setTimeout(() => { readSensor(); }, sensorRefresh);
}

server.addEventListener("initialize", function () {
    if (exports.enabled) setTimeout(() => { startHardwareInterface() }, 1000)
});
