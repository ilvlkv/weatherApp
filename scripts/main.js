// код, обеспечивающий работу табов в интерфейсе

const tabsBtn = document.querySelectorAll(".tabs__nav-btn");
const tabsItems = document.querySelectorAll(".tabs__item");

tabsBtn.forEach(clickOnTab);

document.querySelector(".tabs__nav-btn").click();

function clickOnTab(item) {
  item.addEventListener("click", function () {
    let currentBtn = item;
    let tabId = currentBtn.getAttribute("data-tab");
    let currentTab = document.querySelector(tabId);

    if (!currentBtn.classList.contains("active")) {
      tabsBtn.forEach(function (item) {
        item.classList.remove("active");
      });

      tabsItems.forEach(function (item) {
        item.classList.remove("active");
      });

      currentBtn.classList.add("active");
      currentTab.classList.add("active");
    }
  });
}

// буфферные массивы и переменные

const weatherObjectsTempArray = [];

const savedLocationsList = [];

const forecastObjectsTempArray = [];

const locationGeoCoordinatesBuffer = [];

let timeExternalBuffer;

let dateExternalBuffer;

let cityNameExternalBuffer;

// проверяет value поисковой строки, если при submit оно пустое - возвращает warning,
// если нет - выполняет запросы данных о погоде, местного времени, даты, прогноза погоды на ближайшие 5 дней, после чего запускает рендеринг + очищает переменные и массивы с времененными значениями после выполнения рендера

function checkSearchRequestValue() {
  let requestValue = document.getElementById("search__input").value;

  checkLocationSaves();
  clearForecastTempArray();
  clearTabsContentBeforeLoading();

  if (requestValue != "") {
    if (check == true) {
      clearTabsContentBeforeLoading();

      return (
        requestWeatherDataFromServer(),
        requestCurrentTimeAndDate(),
        setTimeout(() => {
          renderFirstTabContent(), renderSecondTabContent();
        }, 0),
        setTimeout(() => {
          renderThirdTabContent();
        }, 1000)
      );
    } else {
      return (
        requestWeatherDataFromServer(),
        requestCurrentTimeAndDate(),
        setTimeout(() => {
          renderFirstTabContent(), renderSecondTabContent();
        }, 0),
        setTimeout(() => {
          renderThirdTabContent();
        }, 1000)
      );
    }
  } else {
    return (
      clearTabsContentBeforeLoading(),
      alert("Error: Input location name in search line")
    );
  }
}

function checkLocationSaves() {
  requestValue = document.getElementById("search__input").value;

  const value = requestValue.slice(0, 1).toUpperCase() + requestValue.slice(1);

  obj = savedLocationsList.find((item) => item.includes(value));

  check = savedLocationsList.includes(obj);

  return check;
}

function clearForecastTempArray() {
  return weatherObjectsTempArray.splice(0, 1);
}

// выполняет запрос на сервер погоды и сохраняет полученные данные в буфферный массив

function requestWeatherDataFromServer() {
  const requestedCityName = document.getElementById("search__input").value;

  const weatherServerUrl = "http://api.openweathermap.org/data/2.5/weather";
  const weatherServerApiKey = "404c85cfa04902e7d19a3dcc7602daa8";

  const weatherUrl = `${weatherServerUrl}?q=${requestedCityName}&appid=${weatherServerApiKey}&units=metric`;

  fetch(weatherUrl)
    .then((Response) => Response.json())
    .then((json) => {
      saveWeatherResponseInTemporaryArray(json);
    })
    .catch((error) => alert(error));
}

function saveWeatherResponseInTemporaryArray(json) {
  let sunset_date = new Date(json.sys.sunset * 1000);
  let sunset_hours = sunset_date.getHours();
  let sunset_minutes = sunset_date.getMinutes();

  const sunset_time = `${sunset_hours}:${sunset_minutes}`;

  let sunrise_date = new Date(json.sys.sunrise * 1000);
  let sunrise_hours = sunrise_date.getHours();
  let sunrise_minutes = sunrise_date.getMinutes();

  const sunrise_time = `${sunrise_hours}:${sunrise_minutes}`;

  return (
    weatherObjectsTempArray.push(
      (obj = {
        name: json.name,
        temp: json.main.temp,
        feels_like_temp: json.main.feels_like,
        weather: json.weather[0].main,
        weather__icon: json.weather[0].icon,
        sunrise: sunrise_time,
        sunset: sunset_time,
        display: null,
      })
    ),
    (cityNameExternalBuffer = json.name)
  );
}

// получает значения местного времени и даты, возвращает полученные данные в переменные

function requestCurrentTimeAndDate() {
  const requestedCityName = document.getElementById("search__input").value;

  const timeServerUrl = "https://timezone.abstractapi.com/v1/current_time/";
  const timeApiKey = "9ad1f743730e4ee2a813638fbee56543&location";

  const timeUrl = `${timeServerUrl}?api_key=${timeApiKey}=${requestedCityName}`;

  fetch(timeUrl)
    .then((Response) => Response.json())
    .then((json) => {
      return (
        (unformattedDate = json.datetime.slice(0, 10)),
        transformCurrentDate(unformattedDate),
        (timeExternalBuffer = json.datetime.slice(11, 16))
      );
    })
    .catch((error) => alert(error));
}

function transformCurrentDate(unformattedDate) {
  let date_str = unformattedDate.replace(/-/g, ", ");

  const date_elements_array = date_str.split(", ");

  let date = new Date(date_elements_array);

  let options = {
    month: "long",
    day: "numeric",
    weekday: "long",
  };

  return (dateExternalBuffer = date.toLocaleString("en-US", options));
}

// получает координаты запрашиваемой локации исходя из значения cityNameExternalBuffer

function requestLocationGeoCoordinates() {
  let name = cityNameExternalBuffer;

  let requestedCityName;

  if (name == "Tomsk Oblast") {
    requestedCityName = "Tomsk";
  } else {
    requestedCityName = name;
  }

  const weatherServerUrl = "http://api.openweathermap.org/geo/1.0/";
  const weatherServerApiKey = "404c85cfa04902e7d19a3dcc7602daa8";

  const limit = 1;

  const weatherUrl = `${weatherServerUrl}direct?q=${requestedCityName}&limit=${limit}&appid=${weatherServerApiKey}`;

  fetch(weatherUrl)
    .then((Response) => Response.json())
    .then((json) => {
      saveCoordinatesInBuffer(json);
    })
    .catch((error) => alert(error));
}

function saveCoordinatesInBuffer(json) {
  return locationGeoCoordinatesBuffer.push(
    (obj = {
      lat: json[0].lat,
      lon: json[0].lon,
    })
  );
}

// получает данные прогноза погоды

function requestForecastDataFromServer() {
  const weatherServerUrl = "http://api.openweathermap.org/data/2.5/forecast";
  const weatherServerApiKey = "404c85cfa04902e7d19a3dcc7602daa8";

  const lat = locationGeoCoordinatesBuffer[0].lat;
  const lon = locationGeoCoordinatesBuffer[0].lon;

  const weatherUrl = `${weatherServerUrl}?lat=${lat}&lon=${lon}&appid=${weatherServerApiKey}&units=metric`;

  fetch(weatherUrl)
    .then((Response) => Response.json())
    .then((json) => {
      saveForecastResponseInTemporaryArray(json);
    })
    .catch((error) => alert(error));
}

function saveForecastResponseInTemporaryArray(json) {
  const list = json.list;

  list.forEach((item) => {
    forecastObjectsTempArray.push(item);
  });
}

// вызывают рендер табов интерфейса

function renderFirstTabContent() {
  const loading__elements = document.querySelectorAll(".spinner");

  loading__elements.forEach((element) => {
    element.classList.add("active");
  });

  setTimeout(() => {
    loading__elements.forEach((element) => {
      element.classList.remove("active");
    });

    document.getElementById("search__input").value = "";

    obj = weatherObjectsTempArray.find(
      (item) => item.name == cityNameExternalBuffer
    );

    document.getElementById("first_tab__graduses").innerHTML =
      obj.temp.toFixed(1);

    document.querySelector(
      ".weather__picture img"
    ).src = `http://openweathermap.org/img/wn/${obj.weather__icon}@4x.png`;

    document.getElementById("first_tab__city_name").innerHTML = obj.name;

    document.getElementById("current__time").innerHTML = timeExternalBuffer;
    document.getElementById("current__date").innerHTML = dateExternalBuffer;
    document.getElementById("current__date").classList.add("current__date");

    document.querySelector(".save__location-btn").style.display = "block";

    if (check == true) {
      document.querySelector(".save__location-btn").classList.add("active"),
        setActiveLocation();
    }
  }, "3000");
}

function renderSecondTabContent() {
  setTimeout(() => {
    obj = weatherObjectsTempArray.find(
      (item) => item.name == cityNameExternalBuffer
    );

    document.getElementById("city__name").innerHTML = cityNameExternalBuffer;

    document.getElementById(
      "current__temperature"
    ).innerHTML = `${obj.temp} &deg`;

    document.getElementById(
      "current__temperature__feels"
    ).innerHTML = `${obj.feels_like_temp} &deg`;

    document.getElementById("current__weather").innerHTML = obj.weather;

    document.getElementById("sunrise__time").innerHTML = obj.sunrise;

    document.getElementById("sunset__time").innerHTML = obj.sunset;
  }, "3000");
}

function renderThirdTabContent() {
  requestLocationGeoCoordinates();

  const loading__element = document.getElementById("loading_forecast");

  loading__element.classList.add("active");

  setTimeout(() => {
    requestForecastDataFromServer();
  }, 1000);

  setTimeout(() => {
    renderForecast();
    setTimeout(() => {
      loading__element.classList.remove("active");
      document.getElementById("forecast_tab__city_name").innerHTML =
        cityNameExternalBuffer;
    }, 0);
  }, 2000);
}

function clearTabsContentBeforeLoading() {
  document.getElementById("first_tab__graduses").innerHTML = "-";

  document.querySelector(".weather__picture img").src = ``;

  document.getElementById("first_tab__city_name").innerHTML = "-";

  document.getElementById("current__time").innerHTML = "-";

  document.getElementById("current__date").textContent = "Date: -";

  document.getElementById("current__date").classList.remove("current__date");

  document.getElementById("city__name").innerHTML = "-";

  document.getElementById("current__temperature").innerHTML = "-";

  document.getElementById("current__temperature__feels").innerHTML = "-";

  document.getElementById("current__weather").innerHTML = "-";

  document.getElementById("sunrise__time").innerHTML = "-";

  document.getElementById("sunset__time").innerHTML = "-";

  document.getElementById("forecast_tab__city_name").innerHTML = "-";

  let card_list = document.querySelectorAll(".card");

  card_list.forEach((item) => {
    item.remove();
  });

  const savedListElements = document.querySelectorAll(
    ".saved__location_element"
  );

  savedListElements.forEach(function (item) {
    item.classList.remove("active");
  });

  if (
    document.querySelector(".save__location-btn").classList.contains("active")
  ) {
    document.querySelector(".save__location-btn").classList.remove("active");
  }

  document.querySelector(".save__location-btn").style.display = "none";
}

// рендер карточек прогноза погоды

function renderForecast() {
  forecastObjectsTempArray.forEach((item) => {
    let data = item;
    renderForecastCard(data);
  });

  locationGeoCoordinatesBuffer.splice(0, 1);
  forecastObjectsTempArray.splice(0, 40);
}

function renderForecastCard(data) {
  let unformattedDate = data.dt_txt.slice(0, 10);
  transformCurrentDate(unformattedDate);

  const relativeElem = document.querySelector(".card__list");

  let card__div = document.createElement("div");
  card__div.className = "card";

  let card__top = document.createElement("div");
  card__top.className = "card__top";

  let date = document.createElement("p");
  date.innerHTML = dateExternalBuffer;

  let time = document.createElement("p");
  time.innerHTML = data.dt_txt.slice(11, 16);

  card__top.appendChild(date);
  card__top.appendChild(time);

  let card__bottom = document.createElement("div");
  card__bottom.className = "card__bottom";

  let card__temp_block = document.createElement("div");
  card__temp_block.className = "card__temp-block";

  let card__temp_block_temp = document.createElement("p");
  card__temp_block_temp.innerHTML = `Temperature:<br><b>${data.main.temp}</b>`;

  let card__temp_block_feels_like = document.createElement("p");
  card__temp_block_feels_like.innerHTML = `Feels like:<br><b>${data.main.feels_like}</b>`;

  card__temp_block.appendChild(card__temp_block_temp);
  card__temp_block.appendChild(card__temp_block_feels_like);

  let card__weather = document.createElement("div");
  card__weather.className = "card__weather";

  let card__weather_p = document.createElement("p");
  card__weather_p.innerHTML = data.weather[0].main;

  let card__weather_img = document.createElement("img");
  card__weather_img.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  card__weather.appendChild(card__weather_p);
  card__weather.appendChild(card__weather_img);

  card__bottom.appendChild(card__temp_block);
  card__bottom.appendChild(card__weather);

  card__div.appendChild(card__top);
  card__div.appendChild(card__bottom);

  return relativeElem.appendChild(card__div);
}

// добавление локации в избранное

function saveLocationToFavorites() {
  const obj = weatherObjectsTempArray.find(
    (item) => item.name == cityNameExternalBuffer
  );

  const savedObj = savedLocationsList.find(
    (item) => item == cityNameExternalBuffer
  );

  if (savedObj) {
    let flag = confirm("Вы точно хотите удалить данную локацию?");

    if (flag == true) {
      savedLocationsList.splice(savedLocationsList.indexOf(savedObj), 1);

      document.querySelector(".save__location-btn").classList.remove("active");

      deleteSavedLocationBlock();

      removeLocationFromLocalStorage();

      cityNameExternalBuffer = null;

      changeDisplayFlagForLocation();
    }
  } else {
    savedLocationsList.push(obj.name);

    document.querySelector(".save__location-btn").classList.add("active");

    renderSavedLocationBlock();

    setActiveLocation();

    addLocationToLocalStorage();

    changeDisplayFlagForLocation();
  }
}

function renderSavedLocationBlock() {
  const relativeElem = document.querySelector(".locations__list");

  let location__div = document.createElement("div");
  location__div.className = "saved__location_element active";

  let location__div_btn = document.createElement("button");
  location__div_btn.innerHTML = cityNameExternalBuffer;
  location__div_btn.id = cityNameExternalBuffer;
  location__div_btn.className = "city_btn";
  location__div_btn.addEventListener("click", changeSavedLocation);

  location__div.appendChild(location__div_btn);

  relativeElem.append(location__div);
}

function deleteSavedLocationBlock() {
  const elem = document.getElementById(`${cityNameExternalBuffer}`);

  const relativeElem = elem.parentNode;

  return relativeElem.remove();
}

// выделяет активную локацию в списке

function setActiveLocation() {
  const savedListElements = document.querySelectorAll(
    ".saved__location_element"
  );

  savedListElements.forEach(function (item) {
    item.classList.remove("active");
  });

  const elem = document.getElementById(`${cityNameExternalBuffer}`);

  const relativeElem = elem.parentNode;

  return relativeElem.classList.add("active");
}

// добавление и удаление локации в/из localstorage

function addLocationToLocalStorage() {
  (obj = {
    display: "start",
  }),
    localStorage.setItem(cityNameExternalBuffer, JSON.stringify(obj));
}

function removeLocationFromLocalStorage() {
  localStorage.removeItem(cityNameExternalBuffer);
}

// изменение флага "display" у локаций в localstorage

function changeDisplayFlagForLocation() {
  if (cityNameExternalBuffer != null) {
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      localStorage[key] = `{"display":"none"}`;
    }
    localStorage.setItem(cityNameExternalBuffer, `{"display":"start"}`);
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      localStorage[key] = `{"display":"none"}`;
    }
  }
}

// подгрузка списка сохраненных локаций из localstorage в буферный массив

function getSavedLocationListAfterReload() {
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    savedLocationsList.push(key);
  }
}

// рендер последней просмотренной локации после перезагрузки страницы

function renderAfterReload() {
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let obj = localStorage.getItem(key);
    cityNameExternalBuffer = key;
    renderSavedLocationBlock(cityNameExternalBuffer);

    if (obj == `{"display":"start"}`) {
      document.getElementById("search__input").value = key;
    }
  }

  checkSearchRequestValue();

  document.getElementById("search__input").value = "";
}

// переход по сохраненным локациям

function changeSavedLocation() {
  let value = document.querySelector(".saved__location_element:hover")
    .firstChild.textContent;

  document.getElementById("search__input").value = value;

  checkSearchRequestValue();

  document.getElementById("search__input").value = "";

  setTimeout(() => {
    changeDisplayFlagForLocation();
  }, 3000);
}

// обработчики

submit__search.addEventListener("click", checkSearchRequestValue);

saveLocation_btn.addEventListener("click", saveLocationToFavorites);

// триггеры

window.onload = getSavedLocationListAfterReload();

if (savedLocationsList.length != 0) {
  window.onload = renderAfterReload();
}
