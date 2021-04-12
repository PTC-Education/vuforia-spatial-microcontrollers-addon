/*
  Code based on "WiFi Web Server LED Blink" example from WifiNinna library

  Wifi web server for interacting with Arduino IoT hardware interface for Vuforia Spatial Toolbox
  
  Written April, 2021
  by Matt Mueller

 */
#include <SPI.h>
#include <WiFiNINA.h>
#include <ArduinoJson.h>
#include <Arduino_LSM6DS3.h>

#include "arduino_secrets.h" 
///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = "RPiSpatialToolbox";        // your network SSID (name)
char pass[] = "Vuforia123";    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;                 // your network key Index number (needed only for WEP)

String asd;

int status = WL_IDLE_STATUS;
WiFiServer server(80);

void setup() {
  Serial.begin(9600);      // initialize serial communication
  pinMode(13, OUTPUT);      // set the LED pin mode

  // 
  // init wifi
  //
  
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {
    Serial.println("Please upgrade the firmware");
  }

  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);                   // print the network name (SSID);

    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(10000);
  }
  server.begin();                           // start the web server on port 80
  printWifiStatus();                        // you're connected now, so print out the status

  //
  // init Accelerometer
  //
  
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }
  Serial.print("Accelerometer sample rate = ");
  Serial.print(IMU.accelerationSampleRate());
  Serial.println(" Hz");
  Serial.println();
  Serial.println("Acceleration in G's");
  Serial.println("X\tY\tZ");
  
}

StaticJsonDocument<500> doc;

float x, y, z;
long rssi;

void loop() {
  WiFiClient client = server.available();   // listen for incoming clients

  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);
  }
  rssi = WiFi.RSSI();

  doc["AccelX"] = x;
  doc["AccelY"] = y;
  doc["AccelZ"] = z;
  doc["SignalStrength"] = rssi;

  

  if (client) {                             // if you get a client,
    Serial.println("new client");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    String payload = "";
    String pinListener = "";
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        if (c == '\n') {                    // if the byte is a newline character

// if the current line is blank, you got two newline characters in a row.
// that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
// HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
// and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:application/json");
            client.println();

            // the content of the HTTP response follows the header:
            serializeJsonPretty(doc, client);

            // The HTTP response ends with another blank line:
            client.println();

// Body of POST request comes here
            while(client.available())
              {
                char d = client.read();             // read a byte, then
                payload += d;
//                  Serial.write(client.read());
              }
              Serial.print("payload ");
              Serial.println(payload);
              StaticJsonDocument<200> body;
              
              DeserializationError error = deserializeJson(body, payload);
              // Test if parsing succeeds.
              if (error) {
                Serial.print(F("deserializeJson() failed: "));
                Serial.println(error.f_str());
                return;
              }

              JsonObject data = body.as<JsonObject>();
              
              for (int i = 1; i<=13; i++) {
                String pin = String(i);
                if (data.containsKey(pin)) {
                  pinMode(i, OUTPUT);
                  int val = body[pin];
                  digitalWrite(i,val);
                }
              }
              for (int i = 0; i<=7; i++) {
                String pin = "A";
                pin = pin + String(i);
                if (data.containsKey(pin)) {
                  pinMode(pin.toInt(), OUTPUT);
                  int val = body[pin];
                  analogWrite(i,val);
                }
              }
            
            // break out of the while loop:
            break;
          } else {    // if you got a newline, then clear currentLine:
// Look for list of pins that you want to read
            if (currentLine.startsWith("POST")) {
              int firstSpace = currentLine.indexOf(' ');
              int lastSpace = currentLine.lastIndexOf(' ');
              String readPins = currentLine.substring(firstSpace+2,lastSpace+1);
              
                        // Convert from String Object to String.
              char buf[readPins.length()];
              readPins.toCharArray(buf, sizeof(buf));
//              Serial.println(buf);

              int AorD = 0;
              String pinNum = "";

              for(int i=0;i<(sizeof(buf));i++){
//                Serial.println(i);
                if(buf[i] == 'D'){
                  AorD = 1;
                  pinNum = "";
                }
                else if(buf[i] == 'A'){
                  AorD = 2;
                  pinNum = 'A';
                }
                else if(buf[i] == '.'){
                  if(AorD == 1){
                    String pinBody = "D";
                    pinBody = pinBody + pinNum;
                    Serial.println(pinBody);
                    pinMode(pinNum.toInt(), INPUT);
                    int val = digitalRead(pinNum.toInt());
                    doc[pinBody] = val;
                  }
                  else if(AorD == 2){
                    int pin = pinNum.toInt();
                    Serial.print(pinNum);
//                    pinMode(pinNum.toInt(), INPUT);
                    int val = analogRead(pinNum.toInt());
                    Serial.println(val);
                    doc[pinNum] = val;
                  }
                }
                else if(buf[i] == NULL) {
                  break;
                }
                else {
                  pinNum = pinNum + buf[i];
                }
              }
              
            }
            else {
              
            }

            currentLine = "";
            payload = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }


      }
    }
    // close the connection:
    client.stop();
    Serial.println("client disonnected");
  }
}

//void parsePostCall() {
//  int Pin = currentLine.substring(currentLine.indexOf("/"),currentLine.lastIndexOf("/")).toInt();
//  Serial.print("Pin Number read: ");
//  Serial.println(Pin);
//}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your board's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  // print where to go in a browser:
  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);
}
