#include <SPI.h>
#include <WiFly.h>
#include <Servo.h> 

char* ssid = "my$ssid$lol"; //enter your SSID here, replace all spaces with $ (ex. "my ssid lol" = "my$ssid$lol")
char* pass = "abc123"; //enter your wifi passphrase here

char* serverAddress = "1.2.3.4"; //enter the IP of your node.js server
int serverPort = 1337; //enter the port your node.js server is running on, by default it is 1337

const int sonarPin = 5; //digital pin your sonar sensor is plugged into
const int ledPin = 13; //digital pin your LED is plugged into, I recommend 13 since its next to GND
const int rightservoPin = 9; //digital pin your right servo is plguged into
const int leftservoPin = 10; //digital pin your left servo is plguged into

const int rightStopPos = 91; //stop position of your right servo
const int leftStopPos = 91; //stop position of your left servo

long pulse, inches, cm;

Servo rightservo;
Servo leftservo;

WiFlyClient client;

void setup() {
  Serial.begin(9600);
  WiFly.setUart(&Serial);
  WiFly.begin();
  WiFly.join(ssid, pass, true);
  client.connect(serverAddress,serverPort);
 
  rightservo.attach(rightservoPin);
  leftservo.attach(leftservoPin);
  stopMovement();
  pinMode(sonarPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop()
{
  //turn on the LED if the TCP socket is open
  if (client.connected()) {
    digitalWrite(ledPin, HIGH);
  }
  else {
    digitalWrite(ledPin, LOW);
  }
  
  //check for incoming data over TCP
  if (client.available()) {
    char c = client.read();
   
    //command handler (for dialpad digits)
    if (c == '5') {
      pulse = pulseIn(sonarPin, HIGH);
      inches = pulse/147; //convert PWM output from sonar sensor to inches
      client.print(String(inches));
    } 
    else if (c == '2') {
      moveForward();
      client.print("forward"); 
    }
    else if (c == '4') {
      turnLeft();
      client.print("left");
    }
    else if (c == '6') {
      turnRight();
      client.print("right");
    }
    else if (c == '8') {
      moveBackward();
      client.print("back"); 
    }
    else if (c == '0') {
      stopMovement();
      client.print("stopped"); 
    }
  }
}

void stopMovement() {
  rightservo.write(rightStopPos);
  leftservo.write(leftStopPos);
}

void turnLeft() {
  rightservo.write(180);
  leftservo.write(180);
}

void turnRight() {
  rightservo.write(0);
  leftservo.write(0);
}

//motors are reversed since they're on opposite sides of the bot, opposite directions make it go straight!
void moveForward() {
  rightservo.write(180);
  leftservo.write(0);
}

void moveBackward() {
  rightservo.write(0);
  leftservo.write(180);
}
