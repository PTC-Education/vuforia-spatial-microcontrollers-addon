var server = require('@libraries/hardwareInterfaces');
var settings = server.loadHardwareInterface(__dirname);

const fetch = require('node-fetch');

exports.enabled = settings('enabled');
exports.configurable = true;

var objectName = "ArduinoNanoIoT";
var TOOL_NAME = "ArduinoNanoIoT1";
var defaultIP = "192.168.50.174";
var readPins = "D7 D12 A5";
var analogWrite = "A0 A1 A2 A3";
var digitalWrite = "D2 D3 D4 D5 D6 D7"
var readNodeNames = [];
var readNodeNamesLen = 0;

var digitalWriteNames = [];
var analogWriteNames = [];

var sensorRefresh = 100;


// set vars for input values from Arduino IoT
var accelX;
var accelY;
var accelZ;
var signalStrength;
var concatReadPins;

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
    fetch('http://'+ip+'/'+concatReadPins, { 
        method: 'POST', 
        timeout: 5000,
        body:    JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.text())
    .then(json => {
        console.log(json)
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

        // loop through read pins and write the values from the nano to the nodes
        for (var i = 0; i < readNodeNamesLen; ++i) {
            server.write(objectName, TOOL_NAME, readNodeNames[i], body.readNodeNames[i], "f");
        }


    })
    .catch(err => console.error(err));
    setTimeout(() => { arduinoComm(defaultIP,body); }, sensorRefresh);
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
           nanoIP: { 
                value: settings('nanoIP', defaultIP), 
                type: 'text',
                default: defaultIP,
                disabled: false,
                helpText: 'The IP address of your Arduino Nano IoT on the same network as the Vuforia Edge Server'
            },
            readPins: {     
                value: settings('readPins', readPins),
                type: 'text',
                default: readPins,
                disabled: false,
                helpText: 'The pins you are reading from. Separate each pin with commas and start digital pins with D and analog pins with A'
            },
            digitalWrite: {  
                value: settings('digitalWrite', digitalWrite),
                type: 'text',
                default: digitalWrite,
                disabled: false,
                helpText: 'Choose which digitalWrite pins to use from the list: D2 D3 D4 D5 D6 D7'
            },
            analogWrite: {  
                value: settings('analogWrite', analogWrite),
                type: 'text',
                default: analogWrite,
                disabled: false,
                helpText: 'Choose which analogWrite pins to use from the list: A0 A1 A2 A3'
            }

        };
    }
    objectName = exports.settings.nanoName.value;
    defaultIP = exports.settings.nanoIP.value;
    readPins = exports.settings.readPins.value;
    digitalWrite = exports.settings.digitalWrite.value;
    analogWrite = exports.settings.analogWrite.value;
    console.log("ArduinoNanoIoT: " + objectName);
    console.log("with ip: " + defaultIP);
    console.log("using read pins: " + readPins);
    console.log("using digital write pins: " + digitalWrite);
    console.log("using analog write pins: " + analogWrite);

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

    // creates a string that represents the pins to read from
    // this string is concatenated with the URL to be sent to the arduino 
    console.log("readPins: " + readPins);
    concatReadPins = readPins.replace(/ /g, ".");
    console.log("new readPins: " + concatReadPins);
    concatReadPins = concatReadPins.concat('.');
    console.log("final readPins: " + concatReadPins);

    // adds each read pin node to the server
    readNodeNames = readPins.split(" ");
    readNodeNamesLen = readNodeNames.length;
    for (var i = 0; i < readNodeNamesLen; ++i) {
        server.addNode(objectName, TOOL_NAME, readNodeNames[i], "node");
    }

    // adds each digital write pin node to the server
    digitalWriteNames = digitalWrite.split(" ");
    var digitalWritelLen = digitalWriteNames.length;
    for (var i = 0; i < digitalWritelLen; ++i) {
        console.log("digital write names: " + digitalWriteNames[i]);
        server.addNode(objectName, TOOL_NAME, digitalWriteNames[i], "node");
    }

    // adds each analog write pin node to the server
    analogWriteNames = analogWrite.split(" ");
    var analogWritelLen = analogWriteNames.length;
    for (var i = 0; i < analogWritelLen; ++i) {
        console.log("analog write names: " + analogWriteNames[i]);
        server.addNode(objectName, TOOL_NAME, analogWriteNames[i], "node");
    }

    var dataVal1, dataVal2, dataVal3, dataVal4, dataVal5, dataVal6;
    var pinNum1, pinNum2, pinNum3, pinNum4, pinNum5, pinNum6;
    var tempBody;

    // gets the pin number for the first digital pin
    var nameLen1 = digitalWriteNames[0].length;
    pinNum1 = digitalWriteNames[0].substring(1, nameLen1);
    console.log("the pin num is: " + pinNum1);

    // read listener for first digital pin - creates a JSON obj to hold the data value
    server.addReadListener(objectName, TOOL_NAME, digitalWriteNames[0], function(data) {
        console.log("in digital write read listener");
        dataVal1 = data.value;
    });

    // gets the pin number for the second digital pin
    var nameLen2 = digitalWriteNames[1].length;
    pinNum2 = digitalWriteNames[1].substring(1, nameLen2);
    console.log("the pin num is: " + pinNum2);

    // read listener for second digital pin - creates a JSON obj to hold the data value
    server.addReadListener(objectName, TOOL_NAME, digitalWriteNames[1], function(data) {
        console.log("in digital write read listener");
        dataVal2 = data.value;
    });

    // gets the pin number for the third digital pin
    var nameLen3 = digitalWriteNames[2].length;
    pinNum3 = digitalWriteNames[2].substring(1, nameLen3);
    console.log("the pin num is: " + pinNum3);

    // read listener for third digital pin - creates a JSON obj to hold the data value
    server.addReadListener(objectName, TOOL_NAME, digitalWriteNames[2], function(data) {
        console.log("in digital write read listener");
        dataVal3 = data.value;
    });

    // // gets the pin number for the fourth digital pin
    // var nameLen4 = digitalWriteNames[3].length;
    // pinNum4 = digitalWriteNames[3].substring(1, nameLen4);
    // console.log("the pin num is: " + pinNum4);

    // // read listener for fourth digital pin - creates a JSON obj to hold the data value
    // server.addReadListener(objectName, TOOL_NAME, digitalWriteNames[3], function(data) {
    //     console.log("in digital write read listener");
    //     dataVal4 = data.value;
    // });

    // // gets the pin number for the fifth digital pin
    // var nameLen5 = digitalWriteNames[4].length;
    // pinNum5 = digitalWriteNames[4].substring(1, nameLen5);
    // console.log("the pin num is: " + pinNum5);

    // // read listener for fifth digital pin - creates a JSON obj to hold the data value
    // server.addReadListener(objectName, TOOL_NAME, digitalWriteNames[4], function(data) {
    //     console.log("in digital write read listener");
    //     dataVal5 = data.value;
    // });

    // // gets the pin number for the sixth digital pin
    // var nameLen6 = digitalWriteNames[5].length;
    // pinNum6 = digitalWriteNames[5].substring(1, nameLen6);
    // console.log("the pin num is: " + pinNum6);

    // // read listener for sixth digital pin - creates a JSON obj to hold the data value
    // server.addReadListener(objectName, TOOL_NAME, digitalWriteNames[5], function(data) {
    //     console.log("in digital write read listener");
    //     dataVal6 = data.value;
    // });

    server.addReadListener(objectName, TOOL_NAME, "led", function(data){
        console.log("in read listener");
        tempBody = data.value;
    });

    // NOTE: Might have to check format of body!!
    body = {'13' : tempBody, [pinNum1] : dataVal1, [pinNum2] : dataVal2, [pinNum3] : dataVal3/*, [pinNum4] : dataVal4, [pinNum5] : dataVal5, [pinNum6] : dataVal6*/};
    console.log(body);

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