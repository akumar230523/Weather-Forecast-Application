const sc = document.querySelector("#search-city");                        // search city button
const sl = document.querySelector("#search-location");                    // search location button
const dm = document.querySelector("#dropdown-menu");
const s1 = document.querySelector("#s1");
const fc = document.querySelector("#forecast");

// OpenWeather API key
const API_key = "7d4b6afb6c827477180a2f9fca802609";

sc.addEventListener("click", searchCity);
sl.addEventListener("click", searchLocation);


// --------------------------------------------------------------------------------------------- Search City Function ----->


function searchCity() {
    let cityname = document.querySelector("input").value;    // get input value
    if (cityname) {
        // get city data from url_1 - ( https://openweathermap.org/api/geocoding-api )
        const url_1 = `https://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${API_key}`;
        fetch(url_1)
            .then(response => response.json() )
            .then((data) => {
                if (data.length == 1) {
                    citylocationData(data);
                }
                else {
                    alert("Invalid city name. Please try again.");
                }
            })
            .catch((error) => {
                alert("Failed to fetch city data!");
            });
    }
    else {
        alert("Please enter the city name.");
    }
    document.querySelector("input").value = "";    // clear previous search input
}


// ----------------------------------------------------------------------------------------- Search Location Function ----->


function searchLocation() {
    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // get location data from url_2 - ( https://openweathermap.org/api/geocoding-api#reverse )
        const url_2 = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
        fetch(url_2)
            .then(response => response.json())
            .then((data) => {
                citylocationData(data);
                navigator.geolocation.clearWatch(watchID);    // stop tracking after first successful fetch
            })
            .catch((error) => {
                alert("Failed to fetch location data!");
                navigator.geolocation.clearWatch(watchID);    // stop tracking in case of error
            });
    };
    const error = () => {
        alert("Please, allow access to your location");  
    };
    const watchID = navigator.geolocation.watchPosition(success, error);
}


// ------------------------------------------------------------------------------------------------------------------------X


// Function to extract Country, Latitude, Longitude, Name of city/location.
const citylocationData = (data) => {
    let clln = data[0];
    let country = clln.country;
    let lat = clln.lat;
    let lon = clln.lon;
    let name = clln.name;
    weatherData(country, lat, lon, name);    // call 'Weather Data Function'
    dropdownMenu(name);    // call 'Dropdown Menu Function'
}


// ------------------------------------------------------------------------------------------------


// Dropdown Menu Function
const dropdownMenu = (name) => {
    dm.innerHTML="";    // clear previous search data
    let lsl = localStorage.length;        // lsl (LocalStorage Length)
    // Check city exists or not in localStorage.
    let tf = false;
    for (let i = 0; i < lsl; i++) {
        let cityexists = JSON.parse( localStorage.getItem(i + 1) );
        if (name == cityexists) {
            tf = true;
            break;
        }      
    }
    if (!tf) {
        localStorage.setItem( lsl + 1, JSON.stringify(name) );    // set search city to LocalStorage
    }
    // Display the stored city in dropdown menu.
    for (let i = lsl; i >= 0; i--) {
        let storedname = JSON.parse( localStorage.getItem(i + 1) );    // get search city from LocalStorage
        let btn = document.createElement("div");
        btn.textContent = storedname;
        dm.appendChild(btn);    // add search city in dropdown menu
        btn.onclick = () => {
            document.querySelector("input").value = storedname;    // Set input value
            searchCity();    // call 'Search City Function'
        };
    }
    dm.style.cssText = `background-color: rgba(0, 0, 0, 0.5);`;
}


// -------------------------------------------------------------------------------------------- Weather Data Function ----->


const weatherData = (country, lat, lon, name) => {
    // get weather data from url_3 ( https://openweathermap.org/forecast5 )
    const url_3 =`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;
    fetch(url_3)
        .then(response => response.json())
        .then((data) => {
            fc.innerHTML = "";    // clear previous forecast cards
            for (let i = 0; i < data.list.length; i = i + 8) {
                if (i==0) {   
                    weatherToday(name, country, data.list[i]);    // call 'Weather Today Function'
                }
                else {
                    weatherForecast(data.list[i]);    // call 'Weather Forecast Function'
                }
            }
        })
        .catch((error) => {
            alert("Failed to fetch weather data!");
        });
}


// -------------------------------------------------------------------------------------------------- Weather Today Function


const weatherToday = (name, country, dtihmw) => {        // dtihmw (date, temp, icons, humidity max/min, wind)
    s1.innerHTML = `
                    <div id="w_info1" class="flex flex-col text-center sm:items-start">
                        <p id="temp"> ${(dtihmw.main.temp - 273.15).toFixed(2)}° C </p>
                        <p id="city"> ${name}, ${country} </p>
                        <p id="date"> ${dtihmw.dt_txt.split(" ")[0]} </p>
                    </div>
                    <div id="w_icons">
                        <img src="https://openweathermap.org/img/wn/${dtihmw.weather[0].icon}@2x.png" alt="weather_icons">
                        <figcaption> ${dtihmw.weather[0].description} </figcaption>
                    </div>
                    <div id="w_info2" class="flex flex-col sm:flex-row sm:justify-between">
                        <p> <i class="fa-solid fa-droplet"></i> Humidity: ${dtihmw.main.humidity} % </p>
                        <p> <i class="fa-solid fa-temperature-high"></i> Max: ${(dtihmw.main.temp_max - 273.15).toFixed(2)}° C </p>
                        <p> <i class="fa-solid fa-temperature-low"></i> Min: ${(dtihmw.main.temp_min - 273.15).toFixed(2)}° C </p>
                        <p> <i class="fa-solid fa-wind"></i> Wind: ${dtihmw.wind.speed} m/s </p>
                    </div>
                `;
}


// ----------------------------------------------------------------------------------------------- Weather Forecast Function


const weatherForecast = (dtihw) => {        // dtihw (date, temp, icons, humidity, wind)
    let wc = document.createElement("div");
    // forecast weather card css styling
    wc.style.cssText = `background-color: black;
                        border: 2px solid aqua; 
                        padding: 20px; 
                    `;
    // weather forecast card data
    wc.innerHTML = `
                    <p class="date"> ${dtihw.dt_txt.split(" ")[0]} </p>
                    <p class="temp"> ${(dtihw.main.temp - 273.15).toFixed(2)}° C </p>
                    <img src="https://openweathermap.org/img/wn/${dtihw.weather[0].icon}@2x.png" alt="weather_icon">
                    <p> Humidity: ${dtihw.main.humidity} % </p>
                    <p> Wind: ${dtihw.wind.speed} m/s </p>
                `;
    fc.appendChild(wc);
}


// ------------------------------------------------------------------------------------------------------------------------X