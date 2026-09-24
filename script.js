let currentLocation = null;


/* =========================
   SEARCH WEATHER
========================= */

async function searchWeather() {

    const cityInput =
        document.getElementById("cityInput");

    const city =
        cityInput.value.trim();


    if (city === "") {

        showError(
            "⚠️ Please enter a city name."
        );

        return;

    }


    currentLocation = {
        city: city
    };


    await loadWeather(
        `city=${encodeURIComponent(city)}`
    );

}


/* =========================
   CURRENT LOCATION
========================= */

function getMyLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;

    }


    showLoading();


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            currentLocation = {
                lat: lat,
                lon: lon
            };


            await loadWeather(
                `lat=${lat}&lon=${lon}`
            );

        },


        function() {

            hideLoading();

            showError(
                "📍 Location access was denied. Please search for your city."
            );

        }

    );

}


/* =========================
   LOAD WEATHER
========================= */

async function loadWeather(query) {

    showLoading();

    hideError();


    try {

        const weatherResponse =
            await fetch(
                `/weather?${query}`
            );


        const weatherData =
            await weatherResponse.json();


        if (!weatherResponse.ok) {

            throw new Error(
                weatherData.error ||
                "Unable to load weather."
            );

        }


        displayWeather(
            weatherData
        );


        await loadForecast(
            query
        );

    }


    catch (error) {

        showError(
            "❌ " + error.message
        );

    }


    finally {

        hideLoading();

    }

}


/* =========================
   DISPLAY CURRENT WEATHER
========================= */

function displayWeather(data) {

    document
        .getElementById("city")
        .textContent =
        `${data.city}, ${data.country}`;


    document
        .getElementById("temperature")
        .textContent =
        `${Math.round(data.temperature)}°C`;


    document
        .getElementById("description")
        .textContent =
        data.description;


    document
        .getElementById("feelsLike")
        .textContent =
        `${Math.round(data.feels_like)}°C`;


    document
        .getElementById("humidity")
        .textContent =
        `${data.humidity}%`;


    document
        .getElementById("wind")
        .textContent =
        `${data.wind_speed} m/s`;


    document
        .getElementById("pressure")
        .textContent =
        `${data.pressure} hPa`;


    const weatherIcon =
        document.getElementById(
            "weatherIcon"
        );


    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.icon}@4x.png`;


    weatherIcon.alt =
        data.description;


    document
        .getElementById("sunrise")
        .textContent =
        formatTime(data.sunrise);


    document
        .getElementById("sunset")
        .textContent =
        formatTime(data.sunset);


    document
        .getElementById("weatherCard")
        .style.display =
        "block";


    updateDayNightTheme(
        data.sunrise,
        data.sunset
    );

}


/* =========================
   FORECAST
========================= */

async function loadForecast(query) {

    try {

        const response =
            await fetch(
                `/forecast?${query}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            return;

        }


        const container =
            document.getElementById(
                "forecastContainer"
            );


        container.innerHTML = "";


        const dailyForecast = {};


        data.forecast.forEach(item => {

            const date =
                item.date.split(" ")[0];

            const hour =
                item.date.split(" ")[1];


            if (
                !dailyForecast[date] &&
                hour >= "12:00"
            ) {

                dailyForecast[date] =
                    item;

            }

        });


        const days =
            Object.values(
                dailyForecast
            ).slice(0, 5);


        days.forEach(item => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "forecast-card";


            const date =
                new Date(
                    item.date
                );


            const day =
                date.toLocaleDateString(
                    [],
                    {
                        weekday:
                            "short"
                    }
                );


            card.innerHTML = `

                <div class="forecast-date">
                    ${day}
                </div>

                <img
                    src="https://openweathermap.org/img/wn/${item.icon}@2x.png"
                    alt="${item.description}"
                >

                <div class="forecast-temp">
                    ${Math.round(item.temperature)}°C
                </div>

                <div class="forecast-description">
                    ${item.description}
                </div>

            `;


            container.appendChild(
                card
            );

        });


        document
            .getElementById(
                "forecastSection"
            )
            .style.display =
            "block";

    }

    catch (error) {

        console.log(
            "Forecast Error:",
            error
        );

    }

}


/* =========================
   DAY / NIGHT THEME
========================= */

function updateDayNightTheme(
    sunrise,
    sunset
) {

    const now =
        Date.now() / 1000;


    if (
        now >= sunrise &&
        now <= sunset
    ) {

        document.body.style.background =
            "linear-gradient(135deg,#2563eb,#06b6d4,#38bdf8)";

    }

    else {

        document.body.style.background =
            "linear-gradient(135deg,#111827,#312e81,#1e3a8a)";

    }

}


/* =========================
   DATE & TIME
========================= */

function updateDateTime() {

    const now =
        new Date();


    document
        .getElementById("currentDate")
        .textContent =
        now.toLocaleDateString(
            [],
            {
                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        );


    document
        .getElementById("currentTime")
        .textContent =
        now.toLocaleTimeString(
            [],
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"
            }
        );

}


setInterval(
    updateDateTime,
    1000
);


updateDateTime();


/* =========================
   TIME FORMAT
========================= */

function formatTime(timestamp) {

    const date =
        new Date(
            timestamp * 1000
        );


    return date.toLocaleTimeString(
        [],
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


/* =========================
   LOADING
========================= */

function showLoading() {

    document
        .getElementById("loading")
        .style.display =
        "block";

}


function hideLoading() {

    document
        .getElementById("loading")
        .style.display =
        "none";

}


/* =========================
   ERROR
========================= */

function showError(message) {

    document
        .getElementById("error")
        .textContent =
        message;

}


function hideError() {

    document
        .getElementById("error")
        .textContent =
        "";

}


/* =========================
   ENTER KEY
========================= */

document
    .getElementById("cityInput")
    .addEventListener(
        "keypress",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                searchWeather();

            }

        }
    );