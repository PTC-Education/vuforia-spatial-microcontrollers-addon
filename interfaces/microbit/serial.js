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
            { baudRate: 9600},
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
        // temp = sensorReading[0];
        // temp = sensorReading[0];
    //     // sensorReading = [];
    // //     for (var i = 0; i < sensorReading.length; ++i) {
    // //     console.log(sensorReading[i]);
    // // }
    //     // sensorReading = parseInt(data);
    //     // console.log(sensorReading);
    });

    // // // var raw = port.read();
    // // // if (raw != null) {
    // // //     sensorReading = raw.toString('utf8').substring(0, 2);
    // // // }

    // port.on('readable', function() {
    //     raw = port.read();
    //     if (raw != null) {
    //         temp = raw.toString('utf8');
    //         console.log(temp);
    //     }
    // })
}

function getSensor () {
    readPort();
    return sensorReading;
}

module.exports = {
    openPort : openPort,
    writePort : writePort,
    // readPort : readPort,
    getSensor : getSensor
};

