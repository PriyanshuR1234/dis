// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Analyze Soil Function
async function analyzeSoil() {
  const city = document.getElementById("city").value.trim();

  if (!city) {
    alert("Please enter a city.");
    return;
  }

  try {
    const snapshot = await get(ref(database, "npk")); // <-- NOW reading from "npk" node

    if (!snapshot.exists()) {
      alert("Soil data not found in Firebase.");
      return;
    }

    const data = snapshot.val();
    const { n, p, k, moisture, ph } = data;

    if (
      n === undefined ||
      p === undefined ||
      k === undefined ||
      moisture === undefined ||
      ph === undefined
    ) {
      alert("Incomplete NPK data in database.");
      return;
    }

    const prompt = `
n= ${n}, p= ${p}, k= ${k}, soil_moisture=${moisture} and ph= ${ph} and city=${city} these are the values of nitrogen, phosphorus, potassium, and pH of soil along with moisture of soil and city name. Suggest the crops that can be grown in this soil and also can be in this city with cities atmosphere like right know the summer season is running so give me that crops which can only be gorwn in this summer season.

NOTE: I only want the names of the materials and the recommendation to add in soil to improve production, no further information also give the crops only which is suitable for this season of summer in the month of may. So, suggest me only those crops which can be grown according to the soil and also city give and in the month of the may(summer).

IMPORTANT NOTE:- Don't give any extra suggestion or anything follow the format only.

The result should be in the following format:

**The soil condition is:

Nitrogen (N):  
Phosphorus (P):  
Potassium (K):  
pH:  
Soil Moisture:  
City:  

**Crops that can be grown in this soil:

1. [Crop Name 1]  
2. [Crop Name 2]  
3. [Crop Name 3]  
4. [Crop Name 4]  
5. [Crop Name 5]  
6. [Crop Name 6]  
7. [Crop Name 7]  
8. [Crop Name 8]
`;

    showLoadingSpinner("Analyzing your soil data...");

    const geminiResponse = await callGeminiAPI(prompt);
    displayStructuredRecommendations(geminiResponse);

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    hideLoadingSpinner();
  }
}

// Call Gemini API
async function callGeminiAPI(prompt) {
  const GEMINI_API_KEY = "AIzaSyDc-d9G6bDsuVXGAOFCzqgpM2pXgvsQhGY"; // Replace if needed

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Gemini API error:", error);
    return "An error occurred while fetching recommendations.";
  }
}

// Display Gemini Response
function displayStructuredRecommendations(response) {
  const section = document.getElementById("recommendations-section");
  const div = document.getElementById("recommendations");

  section.classList.remove("hidden");
  div.innerHTML = "";

  const lines = response.split("\n");
  const container = document.createElement("div");

  let delay = 0.1;
  lines.forEach((line) => {
    if (line.trim() === "" || line.includes("Gemini can make mistakes")) return;

    const p = document.createElement("p");

    if (line.startsWith("**")) {
      p.className = 'heading-highlight';

      // Choose icon based on heading text
      let icon = document.createElement('span');
      icon.className = 'icon';
      if (line.toLowerCase().includes("soil condition")) {
        icon.textContent = "🌱"; // or use a leaf: "🌱"
      } else if (line.toLowerCase().includes("crops that can be grown")) {
        icon.textContent = "🌾"; // or "🌱"
      } else {
        icon.textContent = "📋";
      }

      p.appendChild(icon);
      p.appendChild(document.createTextNode(line.replace("**", "").trim()));
    } else {
      p.textContent = line;
    }

    // Add staggered animation delay
    p.style.animationDelay = `${delay}s`;
    delay += 0.12;

    container.appendChild(p);
  });

  div.appendChild(container);
}

// Attach Event Listener
document.getElementById("analyze-btn").addEventListener("click", analyzeSoil);


// Function to show recommendations with animation
function showRecommendations() {
  const recommendationsSection = document.getElementById('recommendations-section');
  recommendationsSection.classList.remove('hidden');
  recommendationsSection.classList.add('visible');
}

// Function to simulate data fetching with animation
function fetchData() {
  const analyzeBtn = document.getElementById('analyze-btn');
  const recommendationsDiv = document.getElementById('recommendations');

  analyzeBtn.addEventListener('click', () => {
    // Show loading animation
    const loadingCircle = document.createElement('div');
    loadingCircle.className = 'loading-circle';
    recommendationsDiv.innerHTML = ''; // Clear previous content
    recommendationsDiv.appendChild(loadingCircle);

    // Simulate loading
    analyzeBtn.textContent = 'Loading...';
    setTimeout(() => {
      analyzeBtn.textContent = 'Analyze Soil';
      recommendationsDiv.removeChild(loadingCircle); // Remove loading animation
      showRecommendations();
    }, 2000); // Simulate a 2-second fetch time
  });
}

// Initialize fetch data function
fetchData();

function showLoadingSpinner(message = "Analyzing your soil data...") {
    // Remove any existing overlay
    const oldOverlay = document.getElementById('loading-overlay');
    if (oldOverlay) oldOverlay.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';

    // Create modal box
    const modal = document.createElement('div');
    modal.className = 'loading-modal';

    // Create heading
    const heading = document.createElement('div');
    heading.className = 'loading-heading';
    heading.textContent = "Soil Analysis";

    // Create spinner
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    const spinnerRing = document.createElement('div');
    spinnerRing.className = 'spinner-ring';

    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(spinnerRing);

    // Create message
    const msg = document.createElement('div');
    msg.className = 'loading-message';
    msg.textContent = message;

    // Append
    modal.appendChild(heading);
    modal.appendChild(spinnerContainer);
    modal.appendChild(msg);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function hideLoadingSpinner() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
}