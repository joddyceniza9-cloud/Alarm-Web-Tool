const firebaseConfig = {
  apiKey: "AIzaSyD5kzuL1be8ZtOCUNVuR-MEiaWJHGD2-28",
  authDomain: "alarm-web-tool.firebaseapp.com",
  databaseURL: "https://alarm-web-tool-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "alarm-web-tool",
  storageBucket: "alarm-web-tool.firebasestorage.app",
  messagingSenderId: "923888254761",
  appId: "1:923888254761:web:7306cb71431986daab0138"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const admins = ["Joddy", "Cheska"];
const users = ["Aileen", "Hayazent", "Ralf", "Christian", "Haidee", "Cecill", "Edmar", "Myka"];
let currentUser = "";
let alarmSound = new Audio();

function login() {
    currentUser = document.getElementById('username').value;
    document.getElementById('login-container').style.display = 'none';

    if (admins.includes(currentUser)) {
        showAdminPanel();
    } else {
        showUserPanel();
    }
}

function showAdminPanel() {
    document.getElementById('admin-dashboard').style.display = 'block';
    document.getElementById('admin-name').innerText = currentUser;
    const grid = document.getElementById('user-grid');
    
    // Create controls for all 10 people (including other admin)
    const allPeople = [...admins, ...users];
    allPeople.forEach(name => {
        if(name === currentUser) return; // Don't show self
        grid.innerHTML += `
            <div class="card">
                <h4>${name}</h4>
                <input type="text" id="msg-${name}" placeholder="Type message...">
                <button class="btn-on" onclick="setAlarm('${name}', true)">ON</button>
                <button class="btn-off" onclick="setAlarm('${name}', false)">OFF</button>
            </div>`;
    });
}

function setAlarm(targetName, status) {
    const msg = document.getElementById(`msg-${targetName}`).value;
    // Push data to Firebase
    db.ref('alerts/' + targetName).set({
        active: status,
        message: msg
    });
}

function showUserPanel() {
    document.getElementById('user-dashboard').style.display = 'block';
    
    // Listen for changes in Firebase for THIS user
    db.ref('alerts/' + currentUser).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.active) {
            triggerAlarm(data.message);
        } else {
            stopAlarm();
        }
    });
}

function triggerAlarm(message) {
    // 1. Show the visual first
    document.getElementById('alarm-overlay').style.display = 'block';
    document.getElementById('notif-message').innerText = message;
    
    // 2. Refresh the sound object
    const selectedTone = document.getElementById('tone-selector').value;
    alarmSound.src = selectedTone;
    alarmSound.load(); // Force the browser to load the file
    
    // 3. Play with a "catch" to see if the browser blocked it
    alarmSound.play().catch(error => {
        console.log("Browser blocked autoplay. User needs to click the page first.");
    });
}

function turnOffSelf() {
    // User clicks "Off" on their screen
    db.ref('alerts/' + currentUser).update({ active: false });
}

function stopAlarm() {
    document.getElementById('alarm-overlay').style.display = 'none';
    alarmSound.pause();
}