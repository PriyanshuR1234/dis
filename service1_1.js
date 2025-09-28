// API configuration
const apiHost = 'api.openweathermap.org'; // OpenWeatherMap API host
const apiKey = '20743b1868d48b41d80c78d2f6c73391'; // Your OpenWeatherMap API key

// DOM Elements
const cityInput = document.getElementById('city');
const weatherLoader = document.getElementById('weather-loader');
const weatherResult = document.getElementById('weather-result');
const tomorrowWeatherResult = document.getElementById('tomorrow-weather-result');
const upcomingForecastResult = document.getElementById('upcoming-forecast-result');

// Show/Hide Loader
function showLoader() {
    weatherLoader.style.display = 'block';
    weatherResult.classList.add('hidden');
    tomorrowWeatherResult.classList.add('hidden');
    upcomingForecastResult.classList.add('hidden');
}

function hideLoader() {
    weatherLoader.style.display = 'none';
}

// Function to get weather and forecast
async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showAlert('Please enter a city name');
        return;
    }

    showLoader();

    try {
        const currentWeather = await fetchCurrentWeather(city);
        const forecast = await fetchForecast(city);
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        displayWeather(currentWeather);
        displayForecast(forecast);
        
        // Show results with animation
        weatherResult.classList.remove('hidden');
        weatherResult.classList.add('visible');
        
        setTimeout(() => {
            tomorrowWeatherResult.classList.remove('hidden');
            tomorrowWeatherResult.classList.add('visible');
        }, 300);
        
        setTimeout(() => {
            upcomingForecastResult.classList.remove('hidden');
            upcomingForecastResult.classList.add('visible');
        }, 600);
    } catch (error) {
        showAlert('Error fetching weather data. Please try again.');
        console.error('Error:', error);
    } finally {
        hideLoader();
    }
}

// Fetch Current Weather
async function fetchCurrentWeather(city) {
    const response = await fetch(`https://${apiHost}/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) throw new Error('Weather data not found');
    return await response.json();
}

// Fetch Forecast
async function fetchForecast(city) {
    const response = await fetch(`https://${apiHost}/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) throw new Error('Forecast data not found');
    return await response.json();
}

// Function to display current weather data
function displayWeather(data) {
    const content = weatherResult.querySelector('.weather-card-content');
    content.innerHTML = `
        <div class="weather-info">
            <div class="weather-main">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
                <h2>${Math.round(data.main.temp)}°C</h2>
                <p>${data.weather[0].description}</p>
            </div>
            <div class="weather-details">
                <div class="detail">
                    <i class="fas fa-tint"></i>
                    <span>Humidity: ${data.main.humidity}%</span>
                </div>
                <div class="detail">
                    <i class="fas fa-wind"></i>
                    <span>Wind: ${data.wind.speed} m/s</span>
                </div>
                <div class="detail">
                    <i class="fas fa-compress-arrows-alt"></i>
                    <span>Pressure: ${data.main.pressure} hPa</span>
                </div>
            </div>
        </div>
    `;

    checkForBadWeather(data.weather[0].description);
}

// Function to display tomorrow's weather in a separate box
function displayTomorrowWeather(forecast) {
    // Get the weather for the next 8th entry (24 hours from now)
    const tomorrow = forecast.list[8]; // The 9th entry corresponds to tomorrow's weather (for 24 hours)
    const date = new Date(tomorrow.dt * 1000);
    const temp = tomorrow.main.temp; // Already in Celsius
    const description = tomorrow.weather[0].description;

    const tomorrowHtml = `
        <div class="forecast-box">
            <h3>Tomorrow's weather-:</h3>
            <p><strong>Temperature:</strong> ${temp.toFixed(1)}°C</p>
            <p><strong>Condition:</strong> ${description}</p>
        </div>
    `;

    document.getElementById("tomorrow-weather-result").innerHTML = tomorrowHtml;
}

// Function to display the weather forecast for upcoming days (5 days, 3-hour intervals)
function displayForecast(forecast) {
    // Display tomorrow's weather
    const tomorrowData = forecast.list[8]; // Data for tomorrow (24 hours from now)
    const tomorrowContent = tomorrowWeatherResult.querySelector('.weather-card-content');
    tomorrowContent.innerHTML = `
        <div class="weather-info">
            <div class="weather-main">
                <img src="https://openweathermap.org/img/wn/${tomorrowData.weather[0].icon}@2x.png" alt="Weather icon">
                <h2>${Math.round(tomorrowData.main.temp)}°C</h2>
                <p>${tomorrowData.weather[0].description}</p>
            </div>
            <div class="weather-details">
                <div class="detail">
                    <i class="fas fa-tint"></i>
                    <span>Humidity: ${tomorrowData.main.humidity}%</span>
                </div>
                <div class="detail">
                    <i class="fas fa-wind"></i>
                    <span>Wind: ${tomorrowData.wind.speed} m/s</span>
                </div>
            </div>
        </div>
    `;

    // Display 5-day forecast
    const forecastContent = upcomingForecastResult.querySelector('.forecast-cards');
    forecastContent.innerHTML = '';
    
    // Get one forecast per day (every 8th item, as data is in 3-hour intervals)
    const dailyForecasts = forecast.list.filter((item, index) => index % 8 === 0);
    
    dailyForecasts.forEach((forecast, index) => {
        if (index === 0) return; // Skip today as it's already shown
        
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.style.animationDelay = `${index * 0.1}s`;
        
        // Get weather icon based on weather condition
        const weatherIcon = getWeatherIcon(forecast.weather[0].id);
        
        forecastCard.innerHTML = `
            <h3>${dayName}</h3>
            <p class="date">${dayDate}</p>
            <div class="weather-icon">${weatherIcon}</div>
            <p class="temp">${Math.round(forecast.main.temp)}°C</p>
            <p class="desc">${forecast.weather[0].description}</p>
            <div class="forecast-details">
                <div class="detail">
                    <i class="fas fa-tint"></i>
                    <span>${forecast.main.humidity}%</span>
                </div>
                <div class="detail">
                    <i class="fas fa-wind"></i>
                    <span>${forecast.wind.speed} m/s</span>
                </div>
            </div>
        `;
        
        forecastContent.appendChild(forecastCard);
    });
}

// Function to get appropriate weather icon based on weather condition code
function getWeatherIcon(weatherId) {
    // Weather condition codes from OpenWeather API
    if (weatherId >= 200 && weatherId < 300) {
        return '<i class="fas fa-bolt"></i>'; // Thunderstorm
    } else if (weatherId >= 300 && weatherId < 400) {
        return '<i class="fas fa-cloud-rain"></i>'; // Drizzle
    } else if (weatherId >= 500 && weatherId < 600) {
        return '<i class="fas fa-cloud-showers-heavy"></i>'; // Rain
    } else if (weatherId >= 600 && weatherId < 700) {
        return '<i class="fas fa-snowflake"></i>'; // Snow
    } else if (weatherId >= 700 && weatherId < 800) {
        return '<i class="fas fa-smog"></i>'; // Atmosphere (fog, mist, etc.)
    } else if (weatherId === 800) {
        return '<i class="fas fa-sun"></i>'; // Clear sky
    } else if (weatherId > 800) {
        return '<i class="fas fa-cloud"></i>'; // Clouds
    }
    return '<i class="fas fa-cloud"></i>'; // Default
}

// Function to check for bad weather conditions
function checkForBadWeather(condition) {
    const badConditions = ["rain", "moderate rain", "storm", "snow", "thunder", "hail", "tornado"];

    if (badConditions.some(badCondition => condition.toLowerCase().includes(badCondition))) {
        sendNotification("Weather Alert", `Bad weather detected: ${condition}`);
    }
}

function sendNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: ""
        });
    } else {
        document.getElementById("modal-title").textContent = title;
        document.getElementById("modal-message").textContent = message;
        document.getElementById("weatherModal").style.display = "block";
    }
}

// Show Alert Modal
function showAlert(message) {
    const modal = document.getElementById('weatherModal');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'block';
}

// Close Modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('weatherModal').style.display = 'none';
});

// Close Modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('weatherModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle Enter key in input
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        getWeather();
    }
});