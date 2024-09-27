const apiKey = 'd245fb56ec7fb96b11a130f9d3dc3789'; 
const baseUrlforecast = 'https://api.openweathermap.org/data/2.5/forecast';

const baseUrlweather = 'https://api.openweathermap.org/data/2.5/weather';

async function getWeatherDataForCurrentTime(cityName) {
    const url = `${baseUrlweather}?q=${cityName}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Не вдалося отримати дані погоди');
        }

        const weatherObject = await response.json();
        return weatherObject;
    } catch (error) {
        console.error(`Сталася помилка: ${error.message}`);
    }
}

async function getWeatherDataForDate(cityName, targetDate) {
    const url = `${baseUrlforecast}?q=${cityName}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Не вдалося отримати дані погоди');
        }

        const forecast = await response.json();
        const dailyForecast = forecast.list.filter(f => {
            const forecastDate = new Date(f.dt * 1000);
            return forecastDate.toDateString() === targetDate.toDateString();
        });

        if (dailyForecast.length === 0) {
            throw new Error('Прогноз на вказану дату не знайдено');
        }

        return dailyForecast;
    } catch (error) {
        console.error(`Сталася помилка: ${error.message}`);
    }
}

function GetImg(mainWeather) {
    switch (mainWeather) {
        case "Clear":
            return "Icons/weather.description/Synny&Day.svg"; 
        case "Clouds":
            return "Icons/weather.description/cloudy-svgrepo-com.svg"; 
        case "Rain":
            return "Icons/weather.description/weather-rain-svgrepo-com.svg"; 
        case "Drizzle":
            return "Icons/weather.description/weather-rain-svgrepo-com.svg"; 
        case "Thunderstorm":
            return "Icons/weather.description/rain-storm-svgrepo-com.svg"; 
        case "Snow":
            return "Icons/weather.description/snowy-snow-svgrepo-com.svg"; 
        case "Mist":
            return "Icons/weather.description/mist.svg";
        case "Dust":
            return "Icons/weather.description/Dust.svg"; 
        case "Fog":
            return "Icons/weather.description/Fog.svg"; 
        case "Sand":
            return "Icons/weather.description/Dust.svg"; 
        case "Ash":
            return "Icons/weather.description/Dust.svg"; 
        case "Squall":
            return "Icons/weather.description/hurricane-svgrepo-com.svg"; 
        case "Tornado":
            return "Icons/weather.description/hurricane-svgrepo-com.svg"; 
        default:
            return "Icons/weather.description/null-svgrepo-com.svg"; 
    }
}

function calculateDaylightDuration(sunrise, sunset) {
    const durationMilliseconds = sunset - sunrise;

    const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    return `${durationHours} hr ${durationMinutes} min`;
}


async function updateWeatherData(cityName) {
    const date = new Date();
    let weatherData;
    let currentHtml = '';
    let hourlyHtml = '';

    try {
        const weatherCurrentData = await getWeatherDataForCurrentTime(cityName);
        weatherData = await getWeatherDataForDate(cityName, date);
        
        currentHtml = CreateCurrentHtml(weatherCurrentData);
        UpdateCurrentData(currentHtml);

        weatherData.forEach(forecast => {
            hourlyHtml += CreateHourlyHtml(forecast);
        });

        UpdateHourlyData(hourlyHtml);

    } catch (error) {
        document.querySelector('.js-current-weather-block').style.opacity = '0';
        document.querySelector('.js-hourly-weather-data-grid').style.opacity = '0';
        console.error(`Сталася помилка: ${error.message}`);
    }
}

function UpdateCurrentData(htmlString) {
    const weatherBlock = document.querySelector('.js-current-weather-block');
    weatherBlock.innerHTML = htmlString;

    weatherBlock.style.opacity = '1';
}

function UpdateHourlyData(htmlString) {
    let statickCode = `
        <div class="hours-field">
          TODAY
        </div>

        <div class="icons-field"> 
          
        </div>

        <div class="description-field">
          Forecast
        </div>

        <div class="temperature-field">
          Temp (℃)
        </div>

        <div class="real-feel-temperature-field">
          RealFeel
        </div>
        
        <div class="wind-speed-field">
          Wind(km/h)
        </div>`;
        const weatherBlock = document.querySelector('.js-hourly-weather-data-grid');
        weatherBlock.style.opacity = "1";
        weatherBlock.innerHTML = statickCode + htmlString;
}


function CreateHourlyHtml(forecast) {
    const forecastDate = new Date(forecast.dt * 1000); 
    const time = forecastDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    if (!forecast.weather || forecast.weather.length === 0 || !forecast.main) {
        return ''; 
    }


    let result = `
        <p>${time}</p>
        <img class="hourly-weather-icon" src="${GetImg(forecast.weather[0].main)}"> 
        <p class="under-line">${forecast.weather[0].description}</p>
        <p class="under-line">${Number(forecast.main.temp).toFixed(1)}°</p>
        <p class="under-line">${Number(forecast.main.feels_like).toFixed(0)}°</p>
        <p>${Number(forecast.wind.speed).toFixed(0)} ESE</p> 
    `;

    return result;
}

function CreateCurrentHtml(weather_object)
{
    const date = new Date();
    const shortDate = date.toLocaleDateString('en-US');

    const timezoneOffset = weather_object.timezone * 1000;

    const sunriseData = new Date((weather_object.sys.sunrise + weather_object.timezone) * 1000);
    const sunsetData = new Date((weather_object.sys.sunset + weather_object.timezone) * 1000);

    const sunrise = sunriseData.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const sunset = sunsetData.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    const duration = calculateDaylightDuration(sunriseData, sunsetData);

    let result = `
      <div class="current-date-block">
        <h3>CURRENT WEATHER</h3>
        <h3>${shortDate}</h3>
      </div>

      <div class="current-weather-data-block">

        <div class="weather-description-block">
          <img class="weather-icon" src="${GetImg(weather_object.weather[0].main)}">
          <p class="weather-description">${weather_object.weather[0].description}</p>
        </div>

        <div class="current-temperature-block">
          <h1 class="temperature">${Number(weather_object.main.temp).toFixed(1)}℃</h1>
          <p class="real-feel-temperature">Real Feel ${ Number(weather_object.main.feels_like).toFixed(0)}°</p>
        </div>

        <div class="sun-data-block">
          <p><span>Sunrise:</span> <span>${sunrise}</span></p>
          <p><span>Sunset:</span> <span>${sunset}</span></p>
          <p><span>Duration:</span> <span>${duration}</span></p>
        </div>

      </div>`;

    return result
}



async function main() {
    const cityName = 'Kyiv, UA';
    document.querySelector('.js-search-bar-input').value = cityName;
    const date = new Date(); 
    let weatherData;
    let hourlyHtml = '';
    let currentHtml;


    try {
        weatherCurrentData = await getWeatherDataForCurrentTime(cityName);
        weatherData = await getWeatherDataForDate(cityName, date);

        currentHtml = CreateCurrentHtml(weatherCurrentData);

        document.querySelector('.js-current-weather-block').innerHTML = currentHtml;

        weatherData.forEach(forecast => {
           hourlyHtml += CreateHourlyHtml(forecast);

        });
        
        document.querySelector('.js-hourly-weather-data-grid').innerHTML += hourlyHtml;

    } catch (error) {
        document.querySelector('.js-current-weather-block').style.opacity = '0';
        document.querySelector('.js-hourly-weather-data-grid').style.opacity = '0';
        console.error(`Сталася помилка: ${error.message}`);
    }
}

main();

document.getElementById('js-search-button').addEventListener('click', async () => {
    const cityName = document.querySelector('.js-search-bar-input').value;
    await updateWeatherData(cityName);
});
