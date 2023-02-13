
//Variable to store API key
var apiKey = "9a3bfff35229c3ffa04ea5c6db4cc34e";

//Array to store saved searches
var savedSearches = [];

//Function to store city names in local storage
var historyList = function(cityName) {

  //Removes any existing history with the same city name
  $('.past-search:contains("' + cityName + '")').remove();

  //Creating a new history entry
  var searchedHistoryEntry = $("<p>");
  searchedHistoryEntry.addClass("past-search");
  searchedHistoryEntry.text(cityName);

  //Creating a new search container
  var SearchContainer = $("<div>");
  SearchContainer.addClass("past-search-container");
  SearchContainer.append(searchedHistoryEntry);

  //Appending the new search container to the search history container
  var searchHistoryContainerEl = $("#search-history-container");
  searchHistoryContainerEl.append(SearchContainer);

  //Checking if there are already saved searches
  if (savedSearches.length > 0){
    var beforeSearches = localStorage.getItem("savedSearches");
    savedSearches = JSON.parse(beforeSearches);
  }

  //Adding the new city name to the saved searches array
  savedSearches.push(cityName);

  //Storing the updated saved searches array in local storage
  localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

  //Clearing the search input field
  $("#search-input").val("");
};

//Function to load saved search history
var loadHistory = function() {

  //Getting the saved search history from local storage
  var savedHistory = localStorage.getItem("savedSearches");

  //Checking if there is any saved history
  if (!savedHistory) {
    return false;
  }

  //Converting the saved history from a string to a JavaScript object
  savedHistory = JSON.parse(savedHistory);

  //Iterating over the saved history array
  for (var i = 0; i < savedHistory.length; i++) {

    //Calling the historyList function for each city name in the saved history
    historyList(savedHistory[i]);
  }
};

async function weatherSection(cityName) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`);
    const cityData = await response.json();

    const cityLon = cityData.coord.lon;
    const cityLat = cityData.coord.lat;

    const weatherData = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`);
    const weather = await weatherData.json();

    historyList(cityName);

    const weatherContainer = $("#current-weather-container");
    weatherContainer.addClass("current-weather-container");

    const currentTitle = $("#current-title");
    const currentDay = moment().format("M/D/YYYY");
    currentTitle.text(`${cityName} (${currentDay})`);

    const currentIcon = $("#current-weather-icon");
    currentIcon.addClass("current-weather-icon");
    const currentIconCode = weather.current.weather[0].icon;
    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

    const presentTemprerature = $("#current-temperature");
    presentTemprerature.text("Temperature: " + weather.current.temp + " \u00B0F");

    const presentHumidity = $("#current-humidity");
    presentHumidity.text("Humidity: " + weather.current.humidity + "%");

    const presentWindSpeed = $("#current-wind-speed");
    presentWindSpeed.text("Wind Speed: " + weather.current.wind_speed + " MPH");

    const presentUvIndex = $("#current-uv-index");
    presentUvIndex.text("UV Index: ");
    const presentNumber = $("#current-number");
    presentNumber.text(weather.current.uvi);

    if (weather.present.uvi <= 2) {
      presentNumber.addClass("favorable");
    } else if (weather.present.uvi >= 3 && weather.present.uvi <= 7) {
      presentNumber.addClass("moderate");
    } else {
      presentNumber.addClass("severe");
    }
  } catch (err) {
    $("#search-input").val("");
    alert("We could not find the city you searched for. Try searching for a valid city.");
  }
}

async function fiveDayForecastSection(cityName) {
  try {
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`);
    const weatherData = await weatherResponse.json();
    const cityLon = weatherData.coord.lon;
    const cityLat = weatherData.coord.lat;
    
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();
    console.log(forecastData);
    
    const futureForecastTitle = $("#future-forecast-title");
    futureForecastTitle.text("5-Day Forecast:");
    
    for (let i = 1; i <= 5; i++) {
      const futureCard = $(".future-card");
      futureCard.addClass("future-card-details");
      
      const futureDate = $("#future-date-" + i);
      const date = moment().add(i, "d").format("M/D/YYYY");
      futureDate.text(date);
      
      const futureIcon = $("#future-icon-" + i);
      futureIcon.addClass("future-icon");
      const futureIconCode = forecastData.daily[i].weather[0].icon;
      futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);
      
      const futureTemp = $("#future-temp-" + i);
      futureTemp.text("Temp: " + forecastData.daily[i].temp.day + " \u00B0F");
      
      const futureHumidity = $("#future-humidity-" + i);
      futureHumidity.text("Humidity: " + forecastData.daily[i].humidity + "%");
    }
  } catch (error) {
    console.error(error);
  }
}

$("#search-form").submit(function(event) {
    event.preventDefault();
    var cityName = $("#search-input").val().trim();
    
    if (!cityName) {
        alert("Please enter the name of a city.");
        return false;
    } else {
        weatherSection(cityName);
        fiveDayForecastSection(cityName);
    }
});

$("#search-history-container").on("click", "p", function() {
    var cityName = $(this).text();
    weatherSection(cityName);
    fiveDayForecastSection(cityName);

    $(this).remove();
});

function loadHistory() {
    // code to load search history goes here
}

