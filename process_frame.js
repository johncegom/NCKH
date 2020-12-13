const mqtt = require('mqtt');
host = 'mqtt://127.0.0.1';
port = 1883;
clientMQTT = mqtt.connect(host)
clientMQTT.on('connect', () => {
        console.log('connected to MQTT server.')
        clientMQTT.subscribe('detection/frame', function(err){
                if(!err) {
                        console.log('subscribed.');
                }
        })
});
clientMQTT.on('message', (topic, message) => {
        if(topic == 'detection/frame'){
                //console.log('received frame. ',message);
                //var strImg = String.fromCharCode.apply(null, new Uint8Array(message));
                const img = document.getElementById('image');
                img.src = `data:image/jpeg;base64,${message}`;
        }
});
