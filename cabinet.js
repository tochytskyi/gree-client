
const Gree = require('gree-hvac-client');

var clientCabinet;
var clientCabinetProperies;
const host = '192.168.0.182';
const minTemperature = 20;
const maxTemperature = 23;
const workingTemperature = 23;

function startCabinet() {
    clientCabinet = new Gree.Client({host: host, pollingInterval: 3000});

    clientCabinet.on('connect', () => {
        console.log('connected to Cabinet', clientCabinet.getDeviceId());
    });
    clientCabinet.on('update', (updatedProperties, properties) => {
        clientCabinetProperies = updatedProperties;
        console.log('updated properties for Cabinet', new Date().toLocaleString());
        console.log(updatedProperties);
        
        // Extract the hour in 24-hour format (0-23)
        const now = new Date();
        const hour = now.getHours();
        var isQuietPeriod = (hour >= 23 && hour < 5);
    
        if (!isQuietPeriod && updatedProperties.currentTemperature < minTemperature && properties.power === 'off') {
            console.log('---> HEAT ON Cabinet, temperature:', updatedProperties.currentTemperature);
            clientCabinet.setProperty(Gree.PROPERTY.power, "on");
            clientCabinet.setProperty(Gree.PROPERTY.mode, "heat");
            clientCabinet.setProperty(Gree.PROPERTY.fanspeed, "low");
            clientCabinet.setProperty(Gree.PROPERTY.temperature, workingTemperature);
            clientCabinet.setProperty(Gree.PROPERTY.lights, Gree.VALUE.lights.off);
        }
        if (updatedProperties.currentTemperature >= maxTemperature && properties.power === 'on') {
            console.log('---> HEAT OFF Cabinet, temperature:', updatedProperties.currentTemperature);
            clientCabinet.setProperty(Gree.PROPERTY.power, "off");
        }
    });
    clientCabinet.on('no_response', () => {
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
    startCabinet,
    clientCabinetProperies
};