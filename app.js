const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");
const cityInputElement = document.getElementById("city-input");
const searchButton = document.getElementById("search-btn");
const humidityElement = document.getElementById("humidity-value");
const windSpeedElement = document.getElementById("wind-speed-value");
const dateElement = document.getElementById("current-date");
const timeElement = document.getElementById("current-time");
const weather = {};
weather.temperature = {
    unit : "celsius"
}
const KELVIN = 273.15; 
const key = "82005d27a116c2880c8f0fcb866998a0";
function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString(undefined, dateOptions);
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const formattedTime = now.toLocaleTimeString(undefined, timeOptions);
    dateElement.innerHTML = formattedDate;
    timeElement.innerHTML = formattedTime;
    setTimeout(updateDateTime, 1000);
}
updateDateTime();
if('geolocation' in navigator){
    navigator.geolocation.getCurrentPosition(setPosition, showError);
}else{
    notificationElement.style.display = "block";
    notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation. Please search for a city.</p>";
}
function setPosition(position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    
    getWeatherByCoords(latitude, longitude);
}
function showError(error){
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p>Error: ${error.message}. Please search for a city.</p>`;
}
function getWeatherByCoords(latitude, longitude){
    let api = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
    fetchWeather(api);
}
function getWeatherByCity(city){
    let api = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
    fetchWeather(api);
}
function fetchWeather(api){
    fetch(api)
        .then(function(response){
            if (!response.ok) {
                throw new Error('City not found or API error');
            }
            return response.json();
        })
        .then(function(data){
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
            weather.humidity = data.main.humidity;
            weather.windSpeed = data.wind.speed;
        })
        .then(function(){
            displayWeather();
            setDayNightTheme(weather.iconId); 
            notificationElement.style.display = "none"; 
        })
        .catch(function(error){
            console.log(error);
            notificationElement.style.display = "block";
            notificationElement.innerHTML = `<p>Error fetching weather: ${error.message}. Please check the city name.</p>`;
            displayWeatherPlaceholder();
            setDayNightTheme('default'); 
        });
}

function setDayNightTheme(iconId) {
    const body = document.body;
    if (iconId.endsWith('n')) {
        body.classList.remove('day-time');
        body.classList.add('night-time');
    } else {
        body.classList.remove('night-time');
        body.classList.add('day-time');
    }
}
function displayWeather(){
    let iconHTML = '';
    const iconCode = weather.iconId;
    if (iconCode === '01d') { 
        iconHTML = '<span class="emoji">🌞</span>'; 
    } else if (iconCode === '11d' || iconCode === '11n') { 
        iconHTML = '<span class="emoji">⛈️</span>'; 
    } else {
        iconHTML = `<img src="icons/${weather.iconId}.png"/>`;
    }
    iconElement.innerHTML = iconHTML;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    humidityElement.innerHTML = `${weather.humidity}%`;
    windSpeedElement.innerHTML = `${weather.windSpeed} m/s`;
    weather.temperature.unit = "celsius";
}
function displayWeatherPlaceholder(){
    iconElement.innerHTML = `<img src="icons/unknown.png"/>`;
    tempElement.innerHTML = `- °<span>C</span>`;
    descElement.innerHTML = `-`;
    locationElement.innerHTML = `-`;
    humidityElement.innerHTML = `-`;
    windSpeedElement.innerHTML = `-`;
}
function celsiusToFahrenheit(temperature){
    return (temperature * 9/5) + 32;
}
tempElement.addEventListener("click", function(){
    if(weather.temperature.value === undefined) return;
    if(weather.temperature.unit == "celsius"){
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);
        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    }else{
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius"
    }
});
searchButton.addEventListener("click", function(){
    const city = cityInputElement.value.trim();
    const validationRegex = /^[0-9!@#$%^&*()_+={}\[\]:;"'<,>.?/\\|~`]/;
    if (!city) {
        notificationElement.style.display = "block";
        notificationElement.innerHTML = "<p>Error: Please enter a city name to search.</p>";
        displayWeatherPlaceholder();
    } else if (validationRegex.test(city)) {
        notificationElement.style.display = "block";
        notificationElement.innerHTML = "<p>Error: City name cannot start with a number or special character.</p>";
        displayWeatherPlaceholder();
    } else {
        getWeatherByCity(city);
    }
});
cityInputElement.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        searchButton.click(); 
    }
});