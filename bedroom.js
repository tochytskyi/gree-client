
const Gree = require('gree-hvac-client');

var bedroomClient;
const host = '192.168.0.243';
const minTemperature = 20;
const maxTemperature = 23;
const workingTemperature = 23;

function startBedroom() {
    bedroomClient = new Gree.Client({host: host, pollingInterval: 3000});

    bedroomClient.on('connect', () => {
        console.log('connected to Bedroom', bedroomClient.getDeviceId());
    });
    bedroomClient.on('update', (updatedProperties, properties) => {
        console.log('updated properties for Bedroom', new Date().toLocaleString());
        console.log(updatedProperties);
        
        // Extract the hour in 24-hour format (0-23)
        const now = new Date();
        const hour = now.getHours();
        var isQuietPeriod = (hour >= 23 && hour < 5);
    
        if (!isQuietPeriod && updatedProperties.currentTemperature < minTemperature && properties.power === 'off') {
            console.log('---> HEAT ON Bedroom, temperature:', updatedProperties.currentTemperature);
            bedroomClient.setProperty(Gree.PROPERTY.power, "on");
            bedroomClient.setProperty(Gree.PROPERTY.mode, "heat");
            bedroomClient.setProperty(Gree.PROPERTY.fanspeed, "low");
            bedroomClient.setProperty(Gree.PROPERTY.temperature, workingTemperature);
            bedroomClient.setProperty(Gree.PROPERTY.lights, Gree.VALUE.lights.off);
        }
        if (updatedProperties.currentTemperature >= maxTemperature && properties.power === 'on') {
            console.log('---> HEAT OFF Bedroom, temperature:', updatedProperties.currentTemperature);
            bedroomClient.setProperty(Gree.PROPERTY.power, "off");
        }
    });
    bedroomClient.on('no_response', () => {
    });
    bedroomClient.on('error', (err) => {
        console.error('Error occurred:', err);
        console.log('Attempting to reconnect Bedroom...');
        setTimeout(() => {
            startBedroom();
        }, 10000);
    });
}

module.exports = {
    bedroomClient,
    startBedroom
};