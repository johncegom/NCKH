var sewerState, getDistance;
var closeSewerButton = document.getElementById("button-down");
var openSewerButton = document.getElementById("button-up");
var stopSewerButton = document.getElementById("button-stop");
var currentDistance = document.getElementById("get-distance");
var setDistance = document.getElementById("set-distance");
var connectionStatus = document.getElementById('connection');
var controlModeStatus = document.getElementById('control-mode');
var sewerStateStatus = document.getElementById('sewer-state');
var setScheduleButton = document.getElementById('set-schedule');
var sewerTimeDOM = document.getElementById('sewer-time');
var action = document.getElementById('schedule-action');
var viewScheduleButton = document.getElementById('view-schedule');


function closeSewer() {
    let distance = setDistance.value;
    distance = distance * 10;
    enableSewerButton(closeSewerButton);
    sendMessage(`{${distance},0}`, "controller");
}

function openSewer() {
    let distance = setDistance.value;
    distance = distance * 10;
    enableSewerButton(openSewerButton);
    sendMessage(`{${distance},1}`, "controller");
}

function stopSewer() {
    let distance = setDistance.value;
    distance = distance * 10;
    enableSewerButton(stopSewerButton);
    sendMessage(`{${distance},2}`, "controller");
}

function checkSewerConnection() {
    if (connectionStatus.innerText !== "Not Connected") {
        connectionStatus.innerText = "Disconnected"
    }
}

function setSchedule() {
    // console.log("action: " + action.value);
    let sewerTime = sewerTimeDOM.value;
    let sewerTimeLength = sewerTime.length;
    let sewerTimeExtract = sewerTime.slice(0, sewerTimeLength);
    sewerTimeExtract = sewerTimeExtract.split('T');

    // check not empty date and time
    if ((sewerTimeExtract.length > 1) && (action.value == '1' || action.value == '0')) {
        // send schedule to server
        sendSchedulePackage(sewerTimeExtract[0], sewerTimeExtract[1], action.value);

        getSchedule();

        isScheduleHandled  = false;
    }

}

function sendSchedulePackage(date, time, action) {
    let xhr = new XMLHttpRequest();
    let url = '/schedule';
    // open connection
    xhr.open("POST", url, true);

    // set req header
    xhr.setRequestHeader("Content-Type", "application/json");

    // Create a state change callback
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Print received data from server
            console.log(this.responseText);
        }
    };

    // Converting JSON data to string
    var data = JSON.stringify({"id": Date.now().toString(), "date": date, "time": time, "action": action });

    // Sending data with the request
    xhr.send(data);
}

function getSchedule() {
    axios('/schedule')
    .then((res) => {
        schedule = res.data;
    })
}

function sendRemoveScheduleRequest(scheduleId) {
    axios.post('/schedule/remove', {
        id: scheduleId
    })
}