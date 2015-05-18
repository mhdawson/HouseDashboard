# MQTT/Node base home dashsboard

This projects provides a home dashboard showing temperator, power
usage and other data collected from local sensors.

![picture of dashboard main window](pictures/dashboard_main_window.jpg?raw=true)

The following projects can be used to connect sensors temperature 
sensors and power sensors 
* [PI433WirelessRecvMananager](https://github.com/mhdawson/PI433WirelessRecvManager)

The server requires Node with the following modules installed:

* mqtt
* websocket
 
It also requires:

* an mqtt server 


## TODOs
- extract out hard coded values into a configuration file
- Add more doc on how to configure, setup and run, including the required mqtt server
- Generate page.html from a template so that URL from which to get pictures and be configured in config.txt
- Modify to be able to connect to mqtt server using ssl
- Mobile app for gui would be nice. 

