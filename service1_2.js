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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// References to DOM elements for Firebase data
const temperatureElem = document.getElementById('temperature');
const humidityElem = document.getElementById('humidity');

// Real-time listener for temperature data
const tempRef = database.ref('sensor_data/temperature');
tempRef.on('value', (snapshot) => {
    const temperature = snapshot.val();
    temperatureElem.innerHTML = temperature !== null ? `${temperature.toFixed(1)} &#8451;` : 'N/A';
});

// Real-time listener for humidity data
const humRef = database.ref('sensor_data/humidity');
humRef.on('value', (snapshot) => {
    const humidity = snapshot.val();
    humidityElem.innerHTML = humidity !== null ? `${humidity.toFixed(1)}%` : 'N/A';
});

// OpenWeatherMap API Configuration
const openWeatherMapKey = "99a02143588521f2c348c6b58b28721a"; // Replace with your API key
const latitude = "28.973301"; // Replace with your latitude
const longitude = "77.640188"; // Replace with your longitude

// References to DOM elements for OpenWeatherMap data
const pollutionElem = document.getElementById('pollution');
const uvIndexElem = document.getElementById('uv-index');

// Fetch Pollution Data
const fetchPollutionData = async () => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherMapKey}`);
        const data = await response.json();
        const pollution = data.list[0].components.pm2_5; // PM2.5 level
        pollutionElem.innerHTML = pollution !== undefined ? `${pollution.toFixed(2)} µg/m³` : 'N/A';
    } catch (error) {
        pollutionElem.innerHTML = 'Error';
        console.error('Error fetching pollution data:', error);
    }
};

// Fetch UV Index Data
const fetchUVData = async () => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${openWeatherMapKey}`);
        const data = await response.json();
        const uvIndex = data.value; // UV Index value
        uvIndexElem.innerHTML = uvIndex !== undefined ? uvIndex.toFixed(1) : 'N/A';
    } catch (error) {
        uvIndexElem.innerHTML = 'Error';
        console.error('Error fetching UV data:', error);
    }
};

// Call the functions to fetch data
fetchPollutionData();
fetchUVData();
