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
// var temp = 0;

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

function writePort(msg) {
    port.write(msg);
}

function readPort() {
    parser.on('data', function (data) {
        sensorReading = data.split(",");
    })
}

function getSensor () {
    readPort();
    return sensorReading;
}

module.exports = {
    openPort : openPort,
    writePort : writePort,
    getSensor : getSensor
};

