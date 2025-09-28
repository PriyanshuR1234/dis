// Firebase configuration
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
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const soilForm = document.getElementById('soil-form');
const analyzeButton = document.getElementById('analyze-btn');
const loadingContainer = document.getElementById('loading-container');
const recommendationsSection = document.getElementById('recommendations-section');
const progressBar = document.querySelector('.progress-bar');

// Input fields
const phInput = document.getElementById('ph');
const nitrogenInput = document.getElementById('nitrogen');
const phosphorusInput = document.getElementById('phosphorus');
const potassiumInput = document.getElementById('potassium');
const moistureInput = document.getElementById('moisture');

// Input validation
function setupInputValidation() {
    const inputs = [phInput, nitrogenInput, phosphorusInput, potassiumInput, moistureInput];
    inputs.forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => input.parentElement.classList.remove('focused'));
        input.addEventListener('input', () => validateInput(input));
    });
}

function validateInput(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);

    if (isNaN(value) || value < min || value > max) {
        input.classList.add('invalid');
        input.classList.remove('valid');
    } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
    }
}

// Loading animation
function showLoadingAnimation() {
    loadingContainer.classList.remove('hidden');
    loadingContainer.classList.add('visible');
    analyzeButton.disabled = true;
    analyzeButton.style.opacity = '0.7';
    progressBar.style.width = '0%';
    setTimeout(() => progressBar.style.width = '100%', 100);
}

function hideLoadingAnimation() {
    loadingContainer.classList.remove('visible');
    setTimeout(() => {
        loadingContainer.classList.add('hidden');
        analyzeButton.disabled = false;
        analyzeButton.style.opacity = '1';
    }, 300);
}

// Fetch data from Firebase (corrected path)
async function fetchDataFromFirebase() {
    try {
        const ref = database.ref('npk'); // 🔁 This matches your Firebase structure
        const snapshot = await ref.once('value');
        const data = snapshot.val();

        if (data) {
            phInput.value = data.ph?.toString() || '';
            nitrogenInput.value = data.n?.toString() || '';
            phosphorusInput.value = data.p?.toString() || '';
            potassiumInput.value = data.k?.toString() || '';
            moistureInput.value = data.moisture?.toString() || '';

            analyzeSoil();
        } else {
            showError('No data found in Firebase.');
        }
    } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        showError('Failed to fetch data from Firebase.');
    }
}

// Call Gemini API
async function callGeminiAPI(prompt) {
    const GEMINI_API_KEY = "AIzaSyDc-d9G6bDsuVXGAOFCzqgpM2pXgvsQhGY";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

// Soil analysis
async function analyzeSoil() {
    const ph = parseFloat(phInput.value);
    const nitrogen = parseFloat(nitrogenInput.value);
    const phosphorus = parseFloat(phosphorusInput.value);
    const potassium = parseFloat(potassiumInput.value);
    const moisture = parseFloat(moistureInput.value);

    if ([ph, nitrogen, phosphorus, potassium, moisture].some(isNaN)) {
        showError("Please enter valid numbers for all fields.");
        return;
    }

    showLoadingAnimation();

    const prompt = `
n= ${nitrogen}, p= ${phosphorus}, k= ${potassium}, ph= ${ph}, moisture= ${moisture}. These are the values of nitrogen, phosphorus, potassium, pH, and moisture of soil. Is the condition of the soil good? If not, tell us the name of at least 3-4 organic and inorganic materials along with the quantity that should be added to improve the soil condition in a 10-liter pot.

NOTE: I only want the names of the materials and the quantities to add, no further information.

The result should be in the following format:

The soil condition is:

Nitrogen (N):
Phosphorus (P):
Potassium (K):
pH:
Moisture (%):

To improve the soil:

Organic:
1. [Organic Material Name] - [Quantity]
2. [Organic Material Name] - [Quantity]
3. [Organic Material Name] - [Quantity]

Inorganic:
1. [Inorganic Material Name] - [Quantity]
2. [Inorganic Material Name] - [Quantity]
3. [Inorganic Material Name] - [Quantity]
`;

    try {
        const geminiResponse = await callGeminiAPI(prompt);
        hideLoadingAnimation();
        displayStructuredRecommendations(geminiResponse);
    } catch (error) {
        hideLoadingAnimation();
        showError("An error occurred while analyzing the soil. Please try again later.");
    }
}

// Show recommendations
function displayStructuredRecommendations(response) {
    recommendationsSection.classList.remove("hidden");
    recommendationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const organicRecommendations = document.getElementById("organic-recommendations");
    const inorganicRecommendations = document.getElementById("inorganic-recommendations");
    organicRecommendations.innerHTML = "";
    inorganicRecommendations.innerHTML = "";

    const lines = response.split("\n");

    let nitrogenValue = "-", phosphorusValue = "-", potassiumValue = "-", phValue = "-", moistureValue = "-";
    let currentSection = "", organicItems = [], inorganicItems = [];

    lines.forEach(line => {
        if (line.trim() === "" || line.includes("Gemini can make mistakes")) return;

        if (line.includes("Nitrogen (N):")) nitrogenValue = line.split(":")[1]?.trim();
        else if (line.includes("Phosphorus (P):")) phosphorusValue = line.split(":")[1]?.trim();
        else if (line.includes("Potassium (K):")) potassiumValue = line.split(":")[1]?.trim();
        else if (line.includes("pH:")) phValue = line.split(":")[1]?.trim();
        else if (line.includes("Moisture (%):")) moistureValue = line.split(":")[1]?.trim();
        else if (line.includes("Organic:")) currentSection = "organic";
        else if (line.includes("Inorganic:")) currentSection = "inorganic";
        else if (line.match(/^\d+\./)) {
            const item = line.replace(/^\d+\.\s*/, "").trim();
            if (currentSection === "organic") organicItems.push(item);
            else if (currentSection === "inorganic") inorganicItems.push(item);
        }
    });

    updateSoilStatus("nitrogen-status", nitrogenValue);
    updateSoilStatus("phosphorus-status", phosphorusValue);
    updateSoilStatus("potassium-status", potassiumValue);
    updateSoilStatus("ph-status", phValue);
    updateSoilStatus("moisture-status", moistureValue);

    organicItems.forEach((item, index) => {
        setTimeout(() => addRecommendationItem(organicRecommendations, item), 300 * (index + 1));
    });

    inorganicItems.forEach((item, index) => {
        setTimeout(() => addRecommendationItem(inorganicRecommendations, item), 300 * (index + 1) + 500);
    });
}

// Update values with animation
function updateSoilStatus(elementId, value) {
    const element = document.getElementById(elementId);
    const valueSpan = element.querySelector(".status-value");
    valueSpan.classList.add("highlight");
    valueSpan.textContent = value;
    setTimeout(() => valueSpan.classList.remove("highlight"), 1000);
}

// Add recommendation with animation
function addRecommendationItem(container, text) {
    const li = document.createElement("li");
    li.textContent = text;
    container.appendChild(li);
    li.classList.add("pulse");
    setTimeout(() => li.classList.remove("pulse"), 1000);
}

// Show error
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    soilForm.insertBefore(errorDiv, analyzeButton);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Event listener for fetch button
document.getElementById('fetch-data-btn').addEventListener('click', fetchDataFromFirebase);

// Init
document.addEventListener('DOMContentLoaded', () => {
    setupInputValidation();
});