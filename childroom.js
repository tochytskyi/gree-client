
const Gree = require('gree-hvac-client');

var childroomClient;
const host = '192.168.0.239';
const minTemperature = 20;
const maxTemperature = 22;
const workingTemperature = 23;

function startChildroom() {
    childroomClient = new Gree.Client({host: host, pollingInterval: 3000});

    childroomClient.on('connect', () => {
        console.log('connected to Childroom', childroomClient.getDeviceId());
    });
    childroomClient.on('connect', (client) => {
        console.log('connected to Childroom:', client.getDeviceId());
    });
    childroomClient.on('update', (updatedProperties, properties) => {
        console.log('updated properties for Childroom:', childroomClient.getDeviceId());
        console.log(updatedProperties);
        
        // Extract the hour in 24-hour format (0-23)
        const now = new Date();
        const hour = now.getHours();
        var isQuietPeriod = (hour >= 1 && hour < 7);
    
        if (!isQuietPeriod && updatedProperties.currentTemperature < minTemperature && properties.power === 'off') {
            console.log('heat on Childroom, temperature:', updatedProperties.currentTemperature);
            childroomClient.setProperty(Gree.PROPERTY.power, "on");
            childroomClient.setProperty(Gree.PROPERTY.mode, "heat");
            childroomClient.setProperty(Gree.PROPERTY.fanspeed, "low");
            childroomClient.setProperty(Gree.PROPERTY.temperature, workingTemperature);
            childroomClient.setProperty(Gree.PROPERTY.lights, Gree.VALUE.lights.off);
        }
        if (updatedProperties.currentTemperature >= maxTemperature && properties.power === 'on') {
            console.log('heat off Childroom, temperature:', updatedProperties.currentTemperature);
            childroomClient.setProperty(Gree.PROPERTY.power, "off");
        }
    });
    childroomClient.on('no_response', () => {
        console.log('no response from Childroom');
    });
    childroomClient.on('error', (err) => {
        console.error('Error occurred:', err);
        console.log('Attempting to reconnect Childroom...');
        setTimeout(() => {
            startChildroom();
        }, 10000);
    });
}

module.exports = {
    childroomClient,
    startChildroom
};