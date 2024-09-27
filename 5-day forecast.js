
const apiKey = 'd245fb56ec7fb96b11a130f9d3dc3789'; 
const baseUrlforecast = 'https://api.openweathermap.org/data/2.5/forecast';


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

function getRows(){
  document.querySelector('.js-hourly-weather-data-grid').innerHTML = `
    <div class="hours-field">TODAY</div>
    <div class="icons-field"></div>
    <div class="description-field">Forecast</div>
    <div class="temperature-field">Temp (℃)</div>
    <div class="real-feel-temperature-field">RealFeel</div>
    <div class="wind-speed-field">Wind(km/h)</div>`;

}

function getDayOfWeek(dateCode) {
  const date = new Date(dateCode * 1000); 
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = date.getDay(); 
  return days[dayIndex]; 
}

function formatDate(dateCode) {
  const date = new Date(dateCode * 1000); 
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()]; 
  const day = date.getDate(); 

  return `${month} ${day}`;
}

async function UpdateWeekWeatherData(cityName){
  const dates = [];
  const currentDate = new Date(); 
  weatherData.length = 0; 

  for (let i = 0; i < 5; i++) {
      const date = new Date(currentDate); 
      date.setDate(currentDate.getDate() + i); 
      dates.push(date);
  }

  try {
    for (const date of dates) {
      const data = await getWeatherDataForDate(cityName, date);
      weatherData.push(data);
    }
    
    writeWeekWeatherData();
    
  } catch (error) {
    console.error(`Сталася помилка: ${error.message}`);
    document.querySelector('.js-week-weather-data').innerHTML = '';
    getRows();
  }

}


function writeWeekWeatherData()
{
  let html = '';
  for(let i = 0; i < weatherData.length; i++){
    const currentWeather = weatherData[i][0];
    html += `
    <div class="week-day-data js-week-day-data" data-weather='${JSON.stringify(weatherData[i])}'>
        <div class="week-day">
          <h2 class="current-day">${getDayOfWeek(currentWeather.dt)}</h2>
          <p class="current-date">${formatDate(currentWeather.dt)}</p>
        </div>
        <img class="weather-icon" src="${GetImg(currentWeather.weather[0].main)}">
        <h1 class="temperature-h1">${Number(currentWeather.main.temp).toFixed(1)}℃</h1>
        <p class="description-p">${currentWeather.weather[0].description}</p>
    </div>`; 
  }
  
  

  document.querySelector('.js-week-weather-data').innerHTML = html;


  document.querySelectorAll('.js-week-day-data').forEach((element) => {
    element.addEventListener('click', () => {
      getRows();
      const currentWeather = JSON.parse(element.getAttribute('data-weather'));
      CreateHourlyHtml(currentWeather);
    });
  });
}

let weatherData = [];

async function main() {
  const cityName = 'Kyiv, UA';
  document.querySelector('.js-search-bar-input').value = cityName;
  const dates = [];

  const currentDate = new Date(); 

  for (let i = 0; i < 5; i++) {
      const date = new Date(currentDate); 
      date.setDate(currentDate.getDate() + i); 
      dates.push(date);
  }

  try {
    for (const date of dates) {
      const data = await getWeatherDataForDate(cityName, date);
      weatherData.push(data);
    }
    
    writeWeekWeatherData();
    
  } catch (error) {
    console.error(`Сталася помилка: ${error.message}`);
  }

}

function CreateHourlyHtml(currentWeather) {
  
  let result = '';
  currentWeather.forEach((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000); 
    const time = forecastDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    result += `<p>${time}</p>
    <img class="hourly-weather-icon" src="${GetImg(forecast.weather[0].main)}"> 
    <p class="under-line">${forecast.weather[0].description}</p>
    <p class="under-line">${Number(forecast.main.temp).toFixed(1)}°</p>
    <p class="under-line">${Number(forecast.main.feels_like).toFixed(0)}°</p>
    <p>${Number(forecast.wind.speed).toFixed(0)} ESE</p>`;

  })
  
  document.querySelector('.js-hourly-weather-data-grid').innerHTML += result;
}

main();

document.getElementById('js-search-button').addEventListener('click', async () => {
  getRows();
  const cityName = document.querySelector('.js-search-bar-input').value;
  await UpdateWeekWeatherData(cityName);
});

