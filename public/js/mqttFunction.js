
function startMQTTConnection() {

    // Define hostname, port number and topic
    var host = "104.155.233.176";
    var port = "4000";

    // Generate a random client ID
    clientID = "clientID_" + parseInt(Math.random() * 100);

    // Initialize new Paho client
    client = new Paho.MQTT.Client(host, Number(port), clientID);

    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Connect the client, if successful, call onConnect function
    client.connect({
        onSuccess: onConnect
    });
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log(responseObject.errorMessage);
    }
}
// Called when a message arrives
function onMessageArrived(message) {
    // console.log(message.destinationName + '  | ' + message.payloadString);
    if (message.destinationName == "info") {
        let info = message.payloadString;
        let infoLength = info.length;
        let infoExtract = info.slice(1, infoLength - 1);
        infoExtract = infoExtract.split(',');
        getDistance = infoExtract[0];
        let controlMode = infoExtract[1];
        sewerState = infoExtract[2];

        currentDistance.value = getDistance;
        controlModeStatus.innerText = controlMode;
        sewerStateStatus.innerText = sewerState;

        if (sewerState == "Staying still") {
            enableSewerButton(stopSewerButton);
        }

        if (sewerState == "Moving up") {
            enableSewerButton(openSewerButton);
        }

        if (sewerState == "Moving down") {
            enableSewerButton(closeSewerButton);
        }
    }

    if (message.destinationName == "is_danger") {
        let lastMessage = message.payloadString;
        if (lastMessage === "1") {
            sendMessage("1", "danger")
        } else if (lastMessage === "0") {
            sendMessage("0", "danger")
        };
    }


    if (message.destinationName == "connection") {
        connectionStatus.innerText = message.payloadString;
    }




    if (message.destinationName == "detection/frame") {
        //console.log('received frame');
        //console.log(message.payloadBytes);
        //var strImg = '';
        //var bytes = new Uint8Array( message.payloadString );
        //var len = bytes.byteLength;
        //for (var i = 0; i < len; i++) {
        //strImg += String.fromCharCode( bytes[ i ] );
        //}
        //var strImg = String.fromCharCode.apply(null, new Uint8Array(message.payloadBytes));
        //const img = document.getElementById('image');
        //onsole.log(strImg);
        //img.src = `data:image/jpeg;base64,${strImg}`;
        //img.src = 'data:image/jpeg;base64,'+message.payloadString;
    }
}

// Called when the client connects
function onConnect() {
    // Fetch the MQTT topic from the form
    var topic = "controller";
    console.log('topic: ' + topic);

    // Subscribe to the requested topic
    client.subscribe(topic);
    client.subscribe("info");
    client.subscribe("connection");
    client.subscribe("is_danger");
    client.subscribe("danger");
    client.subscribe("schedule/date");
    client.subscribe("schedule/time");
    client.subscribe("schedule/action");
    //client.subscribe("detection/frame");
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
}

function sendMessage(data, topic) {
    var message = new Paho.MQTT.Message(data);
    message.destinationName = topic;
    client.send(message);
    console.log('sending: ' + data);
}

function enableSewerButton(sewerButton) {
    let button = [openSewerButton, stopSewerButton, closeSewerButton];
    button.forEach(element => {
        if (element === sewerButton) {
            element.style.opacity = "1";
        } else {
            element.style.opacity = "0.5";
        }
    });
}

function sendMessageOnSchedule() {
    let timeStamp = Date.now();
    let dateObj = new Date(timeStamp);
    let day = dateObj.getDate();
    let month = dateObj.getMonth() + 1;
    let year = dateObj.getFullYear();
    let hour = dateObj.getHours();
    let minute = dateObj.getMinutes();

    if (schedule.length > 0) {
        schedule.forEach((item, index) => {
            let scheduleId = item['id'];
            let scheduleDateArray = item['date'].split('-');
            let scheduleTimeArray = item['time'].split(':');
            let scheduleAction = item['action'];

            if ((day == scheduleDateArray[2]) && (month == scheduleDateArray[1]) && (year == scheduleDateArray[0])) {
                // console.log("sewer is scheduled today...");
                if (hour == scheduleTimeArray[0] && minute == scheduleTimeArray[1]) {
                    // control sewer
                    sendMessage(`{0,${scheduleAction}}`, "controller");
                    schedule.splice(index, 1);

                    // send request to remove schedule
                    sendRemoveScheduleRequest(scheduleId);

                    isScheduleHandled = true;
                }
            }
        })
    }
}

