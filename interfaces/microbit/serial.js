/*
 *     serial.js
 *     Alina Shah, 4/29/2021
 *     micro:bit
 *
 *     Finds micro:bit serial port and defines functions to interact with the port
 */

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline({ delimiter: '\r\n' });

var portName = "";

/* check for open serial ports, specifically ARM for microbit */
let purts = new Promise((portconnected,rejected) => {
    SerialPort.list().then(function(ports) {
        for(var i = 0; i < ports.length; i++){
            if(ports[i].manufacturer){
                if(ports[i].manufacturer.includes("ARM")) {
                    portName = ports[i].path;
                    console.log('FTDI port found');
                    portconnected(portName);
                }
            }
        }
    })
});

var port;
var sensorReading = [];

// opens serial port connection with micro:bit
function openPort() {
    purts.then(function (result) {
        console.log('starting hardware interface');
        open(result);
    })
}

function open(result) {
    console.log('portName is ' + portName)
    // baudRate must match with .hex file
    port = new SerialPort(portName, 
            { baudRate: 115200},
    );
    port.pipe(parser);
    port.open(function (err) {
        if (err) {
            return console.log('Error opening port: ', err.message)
        }
        
        // Because there's no callback to write, write errors will be emitted on the port:
        port.write('main screen turn on')
        console.log('port opened')
    });
}

// writes messages to serial port
function writePort(msg) {
    port.write(msg);
}

// splits array read from serial port and the comma
function readPort() {
    parser.on('data', function (data) {
        sensorReading = data.split(",");
    })
}

// returns all values read from the port
function getSensor () {
    readPort();
    return sensorReading;
}

// allows access to these functions within index.js file
module.exports = {
    openPort : openPort,
    writePort : writePort,
    getSensor : getSensor
};

