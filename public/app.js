const loadButton = document.getElementById("loadButton");
const wrapper = document.querySelector(".wrapper");

loadButton.onclick = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation не поддерживается вашим браузером"));
      } else {
        console.log("Определение местоположения…");
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log("Широта = ", latitude, "Долгота = ", longitude);

    const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);

    if (!response.ok) {
      throw new Error("Ошибка сети: " + response.statusText);
    }

    const dataDayly = await response.json();
    console.log(dataDayly);

    const currentWeather = dataDayly.list[0];
    const cityName = dataDayly.city.name;

    // Формируем HTML для текущей погоды
    let weatherHTML = `
      <div id="weatherInfo" class="weather-item">
        <h2>Текущая погода в ${cityName}:</h2>
        <p>Температура: ${currentWeather.main.temp} °C</p>
        <p>Ощущается как: ${currentWeather.main.feels_like} °C</p>
        <p>Влажность: ${currentWeather.main.humidity} %</p>
        <p>Облачность: ${currentWeather.clouds.all} %</p>
        <p>Давление: ${currentWeather.main.pressure} hPa</p>
        <p>Ветер: ${currentWeather.wind.speed} м/с, ${currentWeather.wind.deg}°</p>
        <p>Условия: ${currentWeather.weather[0].description}</p>
      </div>
    `;

    // Добавляем HTML для прогноза на 5 дней (по времени)
    weatherHTML += `<div id="forecast" class="forecast">`;
    weatherHTML += `<h2>Прогноз на 5 дней:</h2>`;

    // Оставляем прогноз только на каждые 12:00 (в полдень)
    const dailyForecast = dataDayly.list.filter((item) =>
      item.dt_txt.includes("12:00:00")
    );

    dailyForecast.forEach((forecast) => {
      weatherHTML += `
        <div class="forecast-item">
          <p><strong>${forecast.dt_txt.split(" ")[0]}</strong></p>
          <p>Температура: ${forecast.main.temp} °C</p>
          <p>Ощущается как: ${forecast.main.feels_like} °C</p>
          <p>Условия: ${forecast.weather[0].description}</p>
          <p>Ветер: ${forecast.wind.speed} м/с</p>
        </div>
      `;
    });

    weatherHTML += `</div>`;

    // Вставляем HTML в контейнер на странице
    wrapper.innerHTML = weatherHTML;
  } catch (error) {
    console.error("Ошибка:", error);
    wrapper.innerHTML = `<p class="error">Не удалось загрузить данные о погоде. Попробуйте позже.</p>`;
  }

  // Скрыть кнопку после загрузки данных
  loadButton.style.display = "none";
};
