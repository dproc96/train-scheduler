var firebaseConfig = {
    apiKey: "AIzaSyC7QyoiBUZiZbykja9dhOxw7Flmkg9zr4Y",
    authDomain: "train-scheduler-78559.firebaseapp.com",
    databaseURL: "https://train-scheduler-78559.firebaseio.com",
    projectId: "train-scheduler-78559",
    storageBucket: "",
    messagingSenderId: "552647575752",
    appId: "1:552647575752:web:fe0152076fdcec7b"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

function addTrainToSchedule (input) {
    let tr = $("<tr>");
    let tdFrom = $("<td>");
    tdFrom.text(input.from);
    tr.append(tdFrom)
    let tdTo = $("<td>");
    tdTo.text(input.to);
    tr.append(tdTo);
    let timeData = calculateNextTrain(input.firstTrainTime, input.lastTrainTime, input.frequency);
    let tdNextTrainTime = $("<td>");
    tdNextTrainTime.text(timeData.time.format("h:mm A"));
    tr.append(tdNextTrainTime);
    let tdNextTrainTimeUntil = $("<td>");
    tdNextTrainTimeUntil.text(timeData.timeUntil + " minutes");
    tr.append(tdNextTrainTimeUntil);
    $("#table").append(tr);
}

function addTrainToDatabase(input) {
    database.ref().child(input.name).set(input);
}

function calculateNextTrain(first, last, frequency) {
    let firstArray = first.split(":");
    let firstHour = firstArray[0];
    let firstMinute = firstArray[1];
    let firstMoment = moment().set("hour", firstHour).set("minute", firstMinute).set("second", "0");
    let lastArray = last.split(":");
    let lastHour = lastArray[0];
    let lastMinute = lastArray[1];
    let lastMoment = moment().set("hour", lastHour).set("minute", lastMinute).set("second", "0");
    let now = moment();
    let timeData
    if (now.isBefore(lastMoment)) {
        let timeSinceLast = now.diff(firstMoment, "minutes") % frequency;
        timeData = {
            timeUntil: frequency - timeSinceLast
        }
        timeData.time = now.add(timeData.timeUntil, "minutes")
    }
    else {
        timeData = {
            time: firstMoment.add(1, "days")
        }
        timeData.timeUntil = timeData.time.diff(now, "minutes")
    }
    console.log(timeData)
    return timeData
}

function pullTrains() {
    database.ref().once("value").then(function(snapshot) {
        console.log(snapshot.val())
        snapshot.forEach(function(child) {
            addTrainToSchedule(child.val())
        })
    })
}

pullTrains()
setInterval(function() {
    $("#table").empty();
    pullTrains();
}, 60000);


$(document).ready(function() {
    $("#add-train").click(function() {
        let input = {
            from: $("#from").val(),
            to: $("#to").val(),
            firstTrainTime: $("#first-departure").val().toString(),
            lastTrainTime: $("#last-departure").val().toString(),
            frequency: $("#frequency").val()
        }
        input.name = escape(input.from) + "-" + escape(input.to)
        addTrainToDatabase(input);
        addTrainToSchedule(input);
        console.log(input)
        calculateNextTrain(input.firstTrainTime, input.lastTrainTime, input.frequency)
    })
})