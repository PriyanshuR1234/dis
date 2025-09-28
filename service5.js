// Firebase Configuration
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
    authDomain: "FIREBASE_AUTH_DOMAIN",
    databaseURL: "https://temperature-and-humidity-72e76-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "temperature-and-humidity-72e76",
    storageBucket: "FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "594699487611",
    appId: "1:594699487611:web:ea0dd066372e30fb8595de",
    measurementId: "G-94Q0S5JY0Q"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Twilio Configuration
const TWILIO_ACCOUNT_SID = 'TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = 'TWILIO_AUTH_TOKEN';
const TWILIO_PHONE_NUMBER = 'TWILIO_PHONE_NUMBER';
const DESTINATION_PHONE_NUMBER = 'DESTINATION_PHONE_NUMBER';

// Twilio Call Function
async function makeTwilioCall() {
  const callInfo = document.getElementById('call-info');
  if (!callInfo) return console.error('call-info element not found.');

  callInfo.innerText = '📞 Calling the nearest fire station and owner...';

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: DESTINATION_PHONE_NUMBER,
          From: TWILIO_PHONE_NUMBER,
          Url: 'https://handler.twilio.com/twiml/EH8882745ba5480409d73a7b841847b7c7',
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Error details:', errorDetails);
      callInfo.innerText = `❌ Failed to make a call. Status: ${response.status}`;
    } else {
      callInfo.innerText = '✅ Call initiated successfully!';
    }
  } catch (error) {
    console.error('Error making the Twilio call:', error);
    callInfo.innerText = '❌ An error occurred while trying to make a call.';
  }
}

// Firebase Listener
function setupFirebaseListener() {
  const flameSensorRef = db.ref('sensor_data');
  flameSensorRef.on('value', (snapshot) => {
    const alert = snapshot.val();
    const alertInfo = document.getElementById('alert-info');
    const coordinatesDiv = document.getElementById('coordinates');

    if (alert?.flame_status === 'Fire Detected') {   // 🔥 changed from 'status' to 'flame_status'
      const lat = parseFloat(alert.latitude);
      const lng = parseFloat(alert.longitude);

      map.setView([lat, lng], 13);
      L.marker([lat, lng]).addTo(map)
        .bindPopup(`🔥 Fire Alert! Location: ${alert.location_name}`)
        .openPopup();

      alertInfo.innerText = `🚨 Fire detected at ${alert.location_name}`;
      coordinatesDiv.innerText = `📍 Coordinates: Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}`;

      makeTwilioCall();  // Call Twilio when fire is detected
    } else {
      alertInfo.innerText = '✅ No fire detected.';
      coordinatesDiv.innerText = '';
    }
  });
}


// Initialize Map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

function initApp() {
  setupFirebaseListener();
}
initApp();
