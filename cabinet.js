
const Gree = require('gree-hvac-client');

var clientCabinet;
const host = '192.168.0.182';
const minTemperature = 20;
const maxTemperature = 22;
const workingTemperature = 23;

function startCabinet() {
    clientCabinet = new Gree.Client({host: host, pollingInterval: 3000});

    clientCabinet.on('connect', () => {
        console.log('connected to Cabinet', clientCabinet.getDeviceId());
    });
    clientCabinet.on('connect', (client) => {
        console.log('connected to Cabinet:', client.getDeviceId());
    });
    clientCabinet.on('update', (updatedProperties, properties) => {
        console.log('updated properties for Cabinet:', clientCabinet.getDeviceId());
        console.log(updatedProperties);
        
        // Extract the hour in 24-hour format (0-23)
        const now = new Date();
        const hour = now.getHours();
        var isQuietPeriod = (hour >= 1 && hour < 7);
    
        if (!isQuietPeriod && updatedProperties.currentTemperature < minTemperature && properties.power === 'off') {
            console.log('heat on Cabinet, temperature:', updatedProperties.currentTemperature);
            clientCabinet.setProperty(Gree.PROPERTY.power, "on");
            clientCabinet.setProperty(Gree.PROPERTY.mode, "heat");
            clientCabinet.setProperty(Gree.PROPERTY.fanspeed, "low");
            clientCabinet.setProperty(Gree.PROPERTY.temperature, workingTemperature);
            clientCabinet.setProperty(Gree.PROPERTY.lights, Gree.VALUE.lights.off);
        }
        if (updatedProperties.currentTemperature >= maxTemperature && properties.power === 'on') {
            console.log('heat off Cabinet, temperature:', updatedProperties.currentTemperature);
            clientCabinet.setProperty(Gree.PROPERTY.power, "off");
        }
    });
    clientCabinet.on('no_response', () => {
        console.log('no response from Cabinet');
    });
    clientCabinet.on('error', (err) => {
        console.error('Error occurred:', err);
        console.log('Attempting to reconnect Cabinet...');
        setTimeout(() => {
            startCabinet();
        }, 10000);
    });
}

module.exports = {
    clientCabinet,
    startCabinet
};