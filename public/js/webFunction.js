var sewerState, getDistance, schedule;
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
var table = document.getElementById('table1');

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

        isScheduleHandled = false;

        $('#schedule-modal').modal('hide');
        tata.success("DOOOOOO","Set schedule successful!");
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
    var data = JSON.stringify({
        "id": Date.now().toString(),
        "date": date,
        "time": time,
        "action": action
    });

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

function viewSchedule() {
    getSchedule();
    document.getElementById('table1').innerHTML = "";
    buildTable(schedule);
    $('#view-schedule-modal').modal('show');
}

function buildTable(arrayData) {
    let action;
    let headRow = `<tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Command</th>
                        <th>Action</th>
                    </tr>`
    table.innerHTML += headRow;
    arrayData.forEach((element, index) => {
        switch (element.action) {
            case "1":
                action = "Open Sewer";
                break;
            case "0":
                action = "Close Sewer";
                break;
            default:
                action = "Error";
                break;
        }
        let row =  `<tr id="delete-${index}">
                        <td>${element.date}</td>
                        <td>${element.time}</td>
                        <td>${action}</td>
                        <td><button class="btn btn-primary" onclick="deleteOneSchedule(${element.id}, ${index})">Cancel</button></td>
                    </tr>
                `;
        table.innerHTML += row;
    });
}

function deleteOneSchedule(dataId, index) {
    sendRemoveScheduleRequest(dataId);
    console.log(dataId);
    let removeElement = document.getElementById(`delete-${index}`).parentNode;
    removeElement.remove();
    getSchedule();
}